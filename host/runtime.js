import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, stat, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';

const ACTIONS = new Set([
  'dependencies', 'list_styles', 'create_style', 'revise_style', 'import_file',
  'convert', 'get_job', 'artifact', 'migrate_styles', 'delete_style',
  'ocr_submit', 'ocr_poll', 'ocr_collect', 'ocr_cancel', 'ocr_fail',
  'token_status', 'set_token', 'clear_token', 'cancel',
]);

/**
 * Identity of the Python payload currently on disk. A plugin reload replaces
 * the package, while a worker started earlier keeps the old modules in memory;
 * comparing this fingerprint lets the next call restart that stale worker.
 */
async function payloadFingerprint(root) {
  const hash = createHash('sha256');
  async function walk(directory) {
    let entries;
    try { entries = await readdir(directory, { withFileTypes: true }); } catch { return; }
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.py')) {
        hash.update(path.relative(root, full));
        hash.update(await readFile(full));
      }
    }
  }
  await walk(root);
  return hash.digest('hex');
}

/** One managed, serialized Python writer for one plugin data root. */
export class WorkerClient {
  #handle;
  #starting;
  #stopping;
  #closed = false;
  #pending = new Map();
  #stderr = '';
  #fingerprint;

  constructor({ subprocess, pythonPath, pythonRoot, dataRoot, timeoutMs = 600_000 }) {
    Object.assign(this, { subprocess, pythonPath, pythonRoot, dataRoot, timeoutMs });
  }

  async #currentFingerprint() {
    try { return await payloadFingerprint(this.pythonRoot); } catch { return undefined; }
  }

  async #start() {
    if (this.#closed) throw new Error('文档转换插件已停止。');
    await this.#stopping;
    if (this.#closed) throw new Error('文档转换插件已停止。');
    if (this.#handle) {
      // A reloaded package must not keep answering from the old in-memory
      // modules: restart once when the payload on disk changed.
      const fingerprint = await this.#currentFingerprint();
      if (!fingerprint || fingerprint === this.#fingerprint) return this.#handle;
      await this.#stop(new Error('文档转换插件已更新，正在重启工作进程。'));
      if (this.#closed) throw new Error('文档转换插件已停止。');
    }
    if (!this.#starting) {
      this.#starting = (async () => {
        await mkdir(this.dataRoot, { recursive: true });
        const python = await this.subprocess.resolveExecutable(this.pythonPath);
        if (this.#closed) throw new Error('文档转换插件已停止。');
        const handle = this.subprocess.spawn({
          argv: [python, '-u', '-m', 'doc_converter.worker', '--data-root', this.dataRoot],
          cwd: this.dataRoot,
          env: { PYTHONPATH: this.pythonRoot, PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' },
          stdio: { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' },
          graceMs: 5000,
        });
        if (!handle.stdin || !handle.stdout || !handle.stderr) {
          handle.terminate();
          await handle.waitForExit();
          await handle.done.catch(() => {});
          throw new Error('运行环境没有提供文档转换工作进程所需的通信管道。');
        }
        this.#stderr = '';
        this.#handle = handle;
        this.#fingerprint = await this.#currentFingerprint();
        const lines = createInterface({ input: handle.stdout, crlfDelay: Infinity });
        handle.stderr.setEncoding('utf8');
        handle.stderr.on('data', (chunk) => { this.#stderr = (this.#stderr + chunk).slice(-8000); });
        lines.on('line', (line) => {
          let reply;
          try { reply = JSON.parse(line); } catch {
            if (this.#handle === handle) void this.#stop(new Error('文档转换工作进程返回了无效数据。')).catch(() => {});
            return;
          }
          const pending = this.#pending.get(reply.id);
          if (!pending) return;
          this.#pending.delete(reply.id);
          clearTimeout(pending.timer);
          if (reply.ok === true) pending.resolve(reply.result);
          else {
            const error = new Error(reply.error?.message || '文档转换操作失败。');
            error.code = reply.error?.code || 'CONVERSION_FAILED';
            pending.reject(error);
          }
        });
        const stopAfterError = (error) => {
          if (this.#handle === handle) void this.#stop(error).catch(() => {});
        };
        const ended = () => {
          lines.close();
          if (this.#handle !== handle) return;
          stopAfterError(new Error(`文档转换工作进程已退出。${this.#stderr ? `\n${this.#stderr}` : ''}`));
        };
        handle.stdin.on('error', stopAfterError);
        handle.stdout.on('error', stopAfterError);
        handle.stderr.on('error', stopAfterError);
        void handle.done.then(ended, ended);
        return handle;
      })().finally(() => { this.#starting = undefined; });
    }
    return this.#starting;
  }

  async call(action, params = {}, timeoutMs = this.timeoutMs) {
    const handle = await this.#start();
    if (this.#closed || this.#handle !== handle || this.#stopping) throw new Error('文档转换工作进程已停止。');
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.#handle === handle) void this.#stop(new Error('转换工作进程超时，已停止本次处理。请检查文档或外部程序后重试。')).catch(() => {});
      }, timeoutMs);
      this.#pending.set(id, { resolve, reject, timer });
      handle.stdin.write(`${JSON.stringify({ id, action, params })}\n`, 'utf8', (error) => {
        if (error && this.#handle === handle) void this.#stop(error).catch(() => {});
      });
    });
  }

  #rejectAll(error) {
    for (const pending of this.#pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.#pending.clear();
  }

  async #stop(error) {
    this.#rejectAll(error);
    if (this.#stopping) return this.#stopping;
    const handle = this.#handle;
    if (!handle) return;
    const stopping = (async () => {
      handle.stdin?.end();
      handle.terminate();
      const exited = await handle.waitForExit();
      if (!exited) throw new Error('无法确认文档转换工作进程已经完全退出。');
      await handle.done.catch(() => {});
      if (this.#handle === handle) this.#handle = undefined;
    })();
    this.#stopping = stopping;
    void stopping.then(() => {
      if (this.#stopping === stopping) this.#stopping = undefined;
    }, () => {});
    return stopping;
  }

  async close() {
    this.#closed = true;
    await this.#starting?.catch(() => {});
    await this.#stop(new Error('文档转换插件已停止。'));
  }
}

/** The same application operations are called by HTTP actions and agent tools. */
export class ConverterOperations {
  #jobs = new Map();
  #active;

  constructor({ worker, dataRoot, resolveSource }) {
    Object.assign(this, { worker, dataRoot, resolveSource });
  }

  async dispatch(action, params = {}) {
    if (!ACTIONS.has(action)) throw new Error(`不支持的文档转换操作：${action}`);
    if (!params || typeof params !== 'object' || Array.isArray(params)) throw new Error('操作参数必须为对象。');
    if (action === 'get_job' && this.#jobs.has(params.job_id)) return this.#jobs.get(params.job_id).job;
    if (action === 'cancel') return this.#cancel(params);
    if (action === 'convert') {
      const current = this.#jobs.get(params.job_id);
      if (current?.job.status === 'running') return current.job;
      if (this.#active) throw new Error('另一份文档正在转换，请完成后再开始。');
      this.#active = params.job_id;
      try {
        const existing = await this.worker.call('get_job', { job_id: params.job_id });
        if (existing.conversion_mode === 'ocr' && existing.status === 'completed') return existing;
        if (existing.conversion_mode === 'ocr') {
          const job = await this.worker.call('ocr_submit', { job_id: params.job_id });
          const state = { job, cancelled: false };
          this.#jobs.set(params.job_id, state);
          state.done = this.#runOcr(params.job_id, state)
            .finally(() => { this.#active = undefined; });
          return job;
        }
        const job = { ...existing, status: 'running', error: null };
        const state = { job };
        this.#jobs.set(params.job_id, state);
        state.done = this.worker.call('convert', params).then((result) => {
          state.job = result;
        }, (error) => {
          state.job = { ...job, status: 'failed', error: error.message };
        }).finally(() => { this.#active = undefined; });
        return job;
      } catch (error) { this.#active = undefined; throw error; }
    }
    if (action === 'import_file' && this.resolveSource) {
      params = { ...params, source_path: await this.resolveSource(params.source_path) };
    }
    return this.worker.call(action, params);
  }

  /** Poll a cloud OCR job without occupying the Python worker between checks. */
  async #runOcr(jobId, state) {
    try {
      await this.#pollOcr(jobId, state);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      state.job = { ...state.job, status: 'failed', error: message };
      try { await this.worker.call('ocr_fail', { job_id: jobId, message }); } catch { /* worker is gone */ }
    }
  }

  async #pollOcr(jobId, state) {
    let failures = 0;
    while (!state.cancelled) {
      let next;
      try {
        next = await this.worker.call('ocr_poll', { job_id: jobId });
        failures = 0;
      } catch (error) {
        failures += 1;
        if (failures >= 3) throw error;
        await new Promise((resolve) => setTimeout(resolve, 2000 * failures));
        continue;
      }
      if (state.cancelled) return;
      state.job = next;
      if (next.status !== 'running') return;
      if (next.ocr?.state === 'done') {
        const finished = await this.worker.call('ocr_collect', { job_id: jobId }, 3_600_000);
        if (state.cancelled) {
          // Results finished arriving after the user cancelled: keep the
          // stopped task visible as cancelled and drop the ready artifacts.
          await this.worker.call('ocr_cancel', { job_id: jobId, force: true });
          state.job = { ...finished, status: 'cancelled', error: null };
          return;
        }
        state.job = finished;
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }

  async #cancel(params) {
    const state = this.#jobs.get(params.job_id);
    if (state && state.job?.status === 'running') {
      // Answer at once: the worker may be busy collecting results, and the
      // user should not wait for that work before seeing the task stopped.
      state.cancelled = true;
      state.job = { ...state.job, status: 'cancelled', error: null };
      void this.worker.call('ocr_cancel', { job_id: params.job_id }).catch(() => {});
      return state.job;
    }
    const job = await this.worker.call('ocr_cancel', { job_id: params.job_id });
    if (state) state.job = job;
    return job;
  }

  async importBytes({ name, bytes, style_pack_id, style_pack_version, output_format }) {
    if (!this.dataRoot) throw new Error('未配置文档转换数据目录。');
    const fileName = path.basename(name.replaceAll('\\', '/'));
    const ocr = /\.(png|jpe?g|bmp|tiff?|webp|pdf)$/i.test(fileName);
    if (!ocr && !/\.(md|markdown|docx|doc)$/i.test(fileName)) {
      throw new Error('请选择 Markdown、DOCX、DOC、图片或 PDF 文件。');
    }
    const limit = (ocr ? 50 : 64) * 1024 * 1024;
    if (!bytes.length || bytes.length > limit) throw new Error(`文件为空或超过 ${ocr ? 50 : 64} MB。`);
    const directory = path.join(this.dataRoot, 'incoming', randomUUID());
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, fileName);
    try {
      await writeFile(source, bytes, { flag: 'wx' });
      return await this.worker.call('import_file', { source_path: source, style_pack_id, style_pack_version, output_format });
    } finally {
      // Only the unique staging directory created above is removed; jobs own a source copy.
      await rm(directory, { recursive: true, force: true });
    }
  }

  async close() {
    await this.worker.close();
    await Promise.all([...this.#jobs.values()].map((state) => state.done).filter(Boolean));
  }
}
