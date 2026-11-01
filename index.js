import { createReadStream } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';
import { WorkerClient, ConverterOperations } from './host/runtime.js';

export const inject = ['tools', 'subprocess', 'connection', 'webServer', 'fs'];
const PREFIX = '/api/dsh-doc-converter';
const PACKAGE = path.dirname(fileURLToPath(import.meta.url));
const MAX_BODY = 65 * 1024 * 1024;

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error('上传内容超过允许大小。');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

function json(res, status, value) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(value));
}

async function isFile(target) {
  try { return (await stat(target)).isFile(); } catch { return false; }
}

export async function apply(ctx, config = {}) {
  const home = process.env.DSH_HOME || (process.env.DSH_PROFILE_DIR
    ? path.resolve(process.env.DSH_PROFILE_DIR, '..', '..') : path.join(os.homedir(), '.dsh'));
  const dataRoot = path.resolve(config.dataRoot || path.join(home, 'storages', 'dsh-doc-converter'));
  const privatePython = path.join(dataRoot, 'venv', 'Scripts', 'python.exe');
  const pythonPath = config.pythonPath || process.env.DOC_CONVERTER_PYTHON
    || (await isFile(privatePython) ? privatePython : 'python');
  const worker = new WorkerClient({ subprocess: ctx.subprocess, pythonPath,
    pythonRoot: path.join(PACKAGE, 'python'), dataRoot });
  const operations = new ConverterOperations({ worker, dataRoot,
    async resolveSource(source) {
      if (typeof source !== 'string' || !path.isAbsolute(source)) throw new Error('请选择执行端文件的完整路径。');
      const target = await ctx.fs.resolve(source);
      const resolved = ctx.fs.processPath(target);
      const info = await stat(resolved);
      if (!info.isFile() || info.size > 64 * 1024 * 1024) throw new Error('源文件不存在或超过 64 MiB。');
      return resolved;
    },
  });
  ctx.effect(() => () => operations.close());

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: PREFIX, async handler(req, res) {
    const rejection = ctx.connection.requestRejection(req);
    if (rejection) { json(res, rejection, { ok: false, error: { code: 'AUTH_REQUIRED', message: '请在当前 DSH 窗口使用文档转换。' } }); return; }
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method === 'POST' && url.pathname === `${PREFIX}/rpc`) {
        const body = JSON.parse((await readBody(req, 2 * 1024 * 1024)).toString('utf8'));
        const result = await operations.dispatch(body.action, body.params || {});
        json(res, 200, { ok: true, result });
      } else if (req.method === 'POST' && url.pathname === `${PREFIX}/import`) {
        const body = await readBody(req, MAX_BODY);
        const form = await new Response(body, { headers: { 'Content-Type': req.headers['content-type'] || '' } }).formData();
        const file = form.get('file');
        if (!file || typeof file === 'string') throw new Error('请选择一个文件。');
        const result = await operations.importBytes({ name: file.name,
          bytes: Buffer.from(await file.arrayBuffer()), style_pack_id: form.get('style_pack_id'),
          style_pack_version: Number(form.get('style_pack_version')) });
        json(res, 200, { ok: true, result });
      } else if (req.method === 'GET' && url.pathname === `${PREFIX}/artifact`) {
        const artifact = await operations.dispatch('artifact', {
          job_id: url.searchParams.get('job_id'), name: url.searchParams.get('name'),
        });
        const info = await stat(artifact.path);
        res.writeHead(200, { 'Content-Type': artifact.mime, 'Content-Length': info.size,
          'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(artifact.name)}`,
          'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
        await pipeline(createReadStream(artifact.path), res);
      } else {
        json(res, 404, { ok: false, error: { code: 'NOT_FOUND', message: '文档转换操作不存在。' } });
      }
    } catch (error) {
      if (res.headersSent) { res.destroy(error); return; }
      json(res, 400, { ok: false, error: { code: error.code || 'CONVERSION_FAILED', message: error.message || String(error) } });
    }
  } }));

  ctx.effect(() => ctx.tools.register({
    name: 'doc_converter',
    description: 'Convert a local Markdown, DOCX or DOC file to styled DOCX, manage immutable styles, and retrieve registered results. Convert starts a job; inspect get_job until completed or failed.',
    parameters: { type: 'object', properties: {
      action: { type: 'string', enum: ['dependencies', 'list_styles', 'create_style', 'revise_style', 'import_file', 'convert', 'get_job', 'artifact', 'migrate_styles', 'delete_style'] },
      source_path: { type: 'string', description: 'Absolute execution-host file path for import_file.' },
      source_root: { type: 'string', description: 'Existing application data root or style-packs directory for migrate_styles; only current effective versions are copied.' },
      style_pack_id: { type: 'string', description: 'Style identity for import_file; optional override for convert.' },
      style_pack_version: { type: 'integer', description: 'Existing immutable style version, paired with style_pack_id.' },
      job_id: { type: 'string', description: 'Job identity for convert, get_job or artifact.' },
      name: { type: 'string', description: 'Style name for create/revise, or registered filename for artifact.' },
      id: { type: 'string', description: 'Style identity for revise_style or delete_style.' },
      base_version: { type: 'integer', description: 'Version being edited for revise_style; a newer revision is never overwritten.' },
      roles: { type: 'object', additionalProperties: true, description: 'Complete style role configuration for revise_style; optional for create_style.' },
      include_roles: { type: 'boolean', description: 'Include full editable roles in list_styles; defaults to false.' },
    }, required: ['action'], additionalProperties: false },
    output: {
      schema: { type: 'object', properties: { result: {} }, required: ['result'], additionalProperties: false },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
    },
    async execute(args, exec) {
      exec.signal.throwIfAborted();
      const { action, include_roles, ...params } = args;
      let result = await operations.dispatch(action, params);
      exec.signal.throwIfAborted();
      if (action === 'list_styles' && !include_roles) {
        result = result.map(({ id, name, version, format_id }) => ({ id, name, version, format_id }));
      }
      return { result };
    },
  }));
}
