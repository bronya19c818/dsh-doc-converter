import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { WorkerClient, ConverterOperations } from '../host/runtime.js';

const root = fileURLToPath(new URL('../../', import.meta.url));
const python = process.env.DOC_CONVERTER_TEST_PYTHON || path.join(root, '.venv', 'Scripts', 'python.exe');
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

test('shared host operations create an immutable style through the real Python worker', async (t) => {
  const dataRoot = await mkdtemp(path.join(os.tmpdir(), 'dsh-doc-converter-host-'));
  const worker = new WorkerClient({
    subprocess: localProcesses, pythonPath: python, dataRoot,
    pythonRoot: path.join(root, 'src'),
  });
  t.after(() => worker.close());
  const operations = new ConverterOperations({ worker });
  const created = await operations.dispatch('create_style', { name: 'Host acceptance' });
  assert.equal(created.name, 'Host acceptance');
  assert.equal(created.version, 1);
  const revised = await operations.dispatch('revise_style', {
    id: created.id, base_version: 1, name: 'Host acceptance revised', roles: created.roles,
  });
  assert.equal(revised.version, 2);
  const original = JSON.parse(await readFile(path.join(dataRoot, 'style-packs', created.id, '1.json'), 'utf8'));
  assert.equal(original.name, 'Host acceptance');
});
