import { randomUUID } from 'node:crypto';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createInterface } from 'node:readline';

const ACTIONS = new Set([
  'dependencies', 'list_styles', 'create_style', 'revise_style', 'import_file',
  'convert', 'get_job', 'artifact', 'migrate_styles', 'delete_style',
]);

/** One managed, serialized Python writer for one plugin data root. */
export class WorkerClient {
  #handle;
  #starting;
  #stopping;
  #closed = false;
  #pending = new Map();
  #stderr = '';

  constructor({ subprocess, pythonPath, pythonRoot, dataRoot, timeoutMs = 600_000 }) {
    Object.assign(this, { subprocess, pythonPath, pythonRoot, dataRoot, timeoutMs });
  }

  async #start() {
    if (this.#closed) throw new Error('文档转换插件已停止。');
    await this.#stopping;
    if (this.#closed) throw new Error('文档转换插件已停止。');
    if (this.#handle) return this.#handle;
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

  async call(action, params = {}) {
    const handle = await this.#start();
    if (this.#closed || this.#handle !== handle || this.#stopping) throw new Error('文档转换工作进程已停止。');
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.#handle === handle) void this.#stop(new Error('转换工作进程超时，已停止本次处理。请检查文档或外部程序后重试。')).catch(() => {});
      }, this.timeoutMs);
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
    if (action === 'convert') {
      const current = this.#jobs.get(params.job_id);
      if (current?.job.status === 'running') return current.job;
      if (this.#active) throw new Error('另一份文档正在转换，请完成后再开始。');
      this.#active = params.job_id;
      try {
        const job = { ...await this.worker.call('get_job', { job_id: params.job_id }), status: 'running', error: null };
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

  async importBytes({ name, bytes, style_pack_id, style_pack_version }) {
    if (!this.dataRoot) throw new Error('未配置文档转换数据目录。');
    if (!bytes.length || bytes.length > 64 * 1024 * 1024) throw new Error('文件为空或超过 64 MiB。');
    const fileName = path.basename(name.replaceAll('\\', '/'));
    if (!/\.(md|markdown|docx|doc)$/i.test(fileName)) throw new Error('请选择 Markdown、DOCX 或 DOC 文件。');
    const directory = path.join(this.dataRoot, 'incoming', randomUUID());
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, fileName);
    try {
      await writeFile(source, bytes, { flag: 'wx' });
      return await this.worker.call('import_file', { source_path: source, style_pack_id, style_pack_version });
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
