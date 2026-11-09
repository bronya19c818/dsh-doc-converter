import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { inflateRawSync } from 'node:zlib';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { WorkerClient, ConverterOperations } from '../host/runtime.js';

const repoRoot = fileURLToPath(new URL('../', import.meta.url));
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function pythonPath() {
  const candidates = [
    process.env.DOC_CONVERTER_TEST_PYTHON,
    path.join(repoRoot, '..', '.venv', 'Scripts', 'python.exe'),
  ].filter(Boolean);
  const found = candidates.find((candidate) => existsSync(candidate));
  if (!found) throw new Error('请用 DOC_CONVERTER_TEST_PYTHON 指向一个 Python 3.12+ 解释器。');
  return found;
}

const localProcesses = {
  async resolveExecutable(command) { return command; },
  spawn(spec) {
    const child = spawn(spec.argv[0], spec.argv.slice(1), {
      cwd: spec.cwd, env: { ...process.env, ...spec.env }, windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const done = new Promise((resolve, reject) => {
      child.once('error', reject);
      child.once('close', (exitCode, signal) => resolve({ exitCode, signal }));
    });
    return {
      stdin: child.stdin, stdout: child.stdout, stderr: child.stderr,
      done, collected: {}, terminate: () => child.kill(),
      async waitForExit() { await done; return true; },
    };
  },
};

function fakeOcrServer() {
  const server = { slow: false, requests: [], polls: new Map(), index: 0 };
  const http = createServer(async (request, response) => {
    const url = new URL(request.url, 'http://127.0.0.1');
    server.requests.push({ method: request.method, path: url.pathname, auth: request.headers.authorization });
    if (request.method === 'POST' && url.pathname === '/api/v2/ocr/jobs') {
      const chunks = [];
      for await (const chunk of request) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString('utf8');
      assert.equal(request.headers.authorization, 'Bearer test-token');
      assert.ok(body.includes('PaddleOCR-VL-1.6'));
      assert.ok(body.includes('name="upload.pdf"') || body.includes('name="upload.png"'));
      server.index += 1;
      const jobId = server.slow ? `slow-${server.index}` : `job-${server.index}`;
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ code: 0, msg: 'Success', data: { jobId } }));
      return;
    }
    if (request.method === 'GET' && url.pathname.startsWith('/api/v2/ocr/jobs/')) {
      const jobId = url.pathname.split('/').pop();
      const polls = (server.polls.get(jobId) ?? 0) + 1;
      server.polls.set(jobId, polls);
      const done = !String(jobId).startsWith('slow-') && polls > 2;
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({
        code: 0, msg: 'Success',
        data: {
          jobId, state: done ? 'done' : 'running',
          extractProgress: { totalPages: 2, extractedPages: done ? 2 : 0 },
          ...(done ? { resultUrl: { jsonUrl: `http://127.0.0.1:${server.port}/jsonl` } } : {}),
        },
      }));
      return;
    }
    if (request.method === 'GET' && url.pathname === '/jsonl') {
      const pages = [
        {
          prunedResult: {
            parsing_res_list: [
              { block_label: 'header', block_content: '附件4' },
              { block_label: 'footnote', block_content: '“三域”指物资库、专业仓、项目/作业现场。' },
              { block_label: 'number', block_content: '1' },
            ],
          },
          markdown: {
            text: '## 测试文档\n\n正文内容 $ ^{1} $。\n\n## 流向示意图\n\n<div style="text-align: center;"><img src="imgs/pic.jpg" alt="Image" width="60%" /></div>\n',
            images: { 'imgs/pic.jpg': `http://127.0.0.1:${server.port}/img/pic.jpg` },
          },
          outputImages: { layout_det_res: `http://127.0.0.1:${server.port}/img/pic.jpg` },
        },
        { markdown: { text: '## 一、工作思路\n\n第二页内容，建立调整机', images: {} } },
        { markdown: { text: '制。\n\n## （一）分级\n\n1.事中管控。第三页内容。', images: {} } },
      ];
      response.writeHead(200, { 'Content-Type': 'application/jsonl' });
      response.end(`${JSON.stringify({ result: { layoutParsingResults: pages } })}\n`);
      return;
    }
    if (request.method === 'GET' && url.pathname === '/img/pic.jpg') {
      response.writeHead(200, { 'Content-Type': 'image/png' });
      response.end(PNG);
      return;
    }
    response.writeHead(404);
    response.end('not found');
  });
  return new Promise((resolve) => {
    http.listen(0, '127.0.0.1', () => {
      server.port = http.address().port;
      server.close = () => new Promise((done) => http.close(done));
      resolve(server);
    });
  });
}

async function readArchiveMarkdown(zipPath) {
  const bytes = await readFile(zipPath);
  for (let offset = 0; offset < bytes.length - 30;) {
    if (bytes.readUInt32LE(offset) !== 0x04034b50) { offset += 1; continue; }
    const method = bytes.readUInt16LE(offset + 8);
    const compressed = bytes.readUInt32LE(offset + 18);
    const nameLength = bytes.readUInt16LE(offset + 26);
    const extraLength = bytes.readUInt16LE(offset + 28);
    const name = bytes.subarray(offset + 30, offset + 30 + nameLength).toString('utf8');
    const start = offset + 30 + nameLength + extraLength;
    const data = bytes.subarray(start, start + compressed);
    if (name.endsWith('.md')) {
      return (method === 8 ? inflateRawSync(data) : data).toString('utf8');
    }
    offset = start + compressed;
  }
  throw new Error('archive has no Markdown file');
}

async function waitForJob(operations, jobId, ms = 30_000) {  const started = Date.now();
  let current = await operations.dispatch('get_job', { job_id: jobId });
  while (!['completed', 'failed', 'cancelled'].includes(current.status) && Date.now() - started < ms) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    current = await operations.dispatch('get_job', { job_id: jobId });
  }
  return current;
}

async function setup({ token = true } = {}) {
  const server = await fakeOcrServer();
  process.env.DOC_CONVERTER_OCR_BASE = `http://127.0.0.1:${server.port}`;
  if (token) process.env.DOC_CONVERTER_PADDLE_TOKEN = 'test-token';
  else delete process.env.DOC_CONVERTER_PADDLE_TOKEN;
  const dataRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-doc-converter-ocr-'));
  const worker = new WorkerClient({
    subprocess: localProcesses, pythonPath: pythonPath(), dataRoot,
    pythonRoot: path.join(repoRoot, 'python'),
  });
  const operations = new ConverterOperations({ worker, dataRoot });
  const pack = await operations.dispatch('create_style', { name: 'OCR acceptance' });
  return { server, worker, operations, pack, dataRoot };
}

async function importFakePdf(operations, pack, outputFormat, name = 'sample.pdf') {
  return operations.importBytes({
    name, bytes: Buffer.from('%PDF-1.4 fake'), output_format: outputFormat,
    style_pack_id: outputFormat === 'docx' ? pack.id : null,
    style_pack_version: outputFormat === 'docx' ? pack.version : null,
  });
}

test('OCR markdown delivery is a zip of normalized Markdown and local images', async (t) => {
  const { server, worker, operations, pack } = await setup();
  t.after(async () => { await worker.close(); await server.close(); });
  const job = await importFakePdf(operations, pack, 'markdown');
  assert.equal(job.conversion_mode, 'ocr');
  assert.equal(job.output_format, 'markdown');
  assert.equal(job.style_pack_id, null);

  await operations.dispatch('convert', { job_id: job.id, output_format: 'markdown' });
  const finished = await waitForJob(operations, job.id);
  assert.equal(finished.status, 'completed', finished.error ?? '');
  assert.equal(finished.artifacts.includes('测试文档.zip'), true);

  const artifact = await operations.dispatch('artifact', { job_id: job.id, name: '测试文档.zip' });
  const bytes = await readFile(artifact.path);
  const archive = bytes.toString('latin1');
  assert.ok(archive.includes('pic.jpg'), 'zip lists page images');

  const delivered = await readArchiveMarkdown(artifact.path);
  assert.ok(delivered.startsWith('# 测试文档\n\n附件 4\n\n正文内容¹。\n\n流向示意图\n'), delivered.slice(0, 120));
  assert.ok(!delivered.includes('title:'), delivered.slice(0, 120));
  assert.ok(!delivered.includes('title:'), delivered.slice(0, 160));

  const normalized = await operations.dispatch('artifact', { job_id: job.id, name: 'normalization-report.json' });
  const report = JSON.parse(await readFile(normalized.path, 'utf8'));
  assert.equal(report.ocr.pages, 3);
  assert.equal(report.integrity.passed, true);
});

test('OCR DOCX output embeds the collected image', async (t) => {
  const { server, worker, operations, pack } = await setup();
  t.after(async () => { await worker.close(); await server.close(); });
  const job = await importFakePdf(operations, pack, 'docx');
  await operations.dispatch('convert', { job_id: job.id });
  const finished = await waitForJob(operations, job.id, 60_000);
  assert.equal(finished.status, 'completed', finished.error ?? '');
  const artifact = await operations.dispatch('artifact', { job_id: job.id, name: finished.output_name });
  const bytes = await readFile(artifact.path);
  assert.ok(bytes.toString('latin1').includes('word/media/'), 'DOCX embeds the OCR image');

  const normalized = await operations.dispatch('artifact', { job_id: job.id, name: 'document.normalized.md' });
  const markdown = await readFile(normalized.path, 'utf8');
  assert.ok(markdown.includes('](images/page-0001/pic.jpg)'), markdown);
  assert.ok(!markdown.includes('<img'));
  assert.ok(markdown.includes('附件 4'), markdown);
  assert.ok(markdown.includes('title: 测试文档'), markdown);
});

test('a running OCR task can be cancelled from the page', async (t) => {
  const { server, worker, operations, pack } = await setup();
  t.after(async () => { await worker.close(); await server.close(); });
  server.slow = true;
  const job = await importFakePdf(operations, pack, 'markdown');
  await operations.dispatch('convert', { job_id: job.id, output_format: 'markdown' });
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const cancelled = await operations.dispatch('cancel', { job_id: job.id });
  assert.equal(cancelled.status, 'cancelled');
  await new Promise((resolve) => setTimeout(resolve, 4500));
  const persisted = await worker.call('get_job', { job_id: job.id });
  assert.equal(persisted.status, 'cancelled');
});

test('the token is stored locally and only its tail is reported', async (t) => {
  const { server, worker, operations } = await setup({ token: false });
  t.after(async () => { await worker.close(); await server.close(); });
  const saved = await operations.dispatch('set_token', { token: 'abcdefgh12345678' });
  assert.deepEqual(saved, { configured: true, source: 'file', hint: '…5678' });
  const cleared = await operations.dispatch('clear_token', {});
  assert.equal(cleared.configured, false);
});