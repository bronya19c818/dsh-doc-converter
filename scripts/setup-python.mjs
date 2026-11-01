import { spawn } from 'node:child_process';
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name) => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1]; };
const python = option('--python');
const dataRoot = option('--data-root');
if (!python || !dataRoot || !path.isAbsolute(python) || !path.isAbsolute(dataRoot)) {
  throw new Error('Usage: node scripts/setup-python.mjs --python <absolute Python 3.12+ executable> --data-root <absolute plugin data root>');
}
const directory = path.resolve(dataRoot, 'venv');
const executable = path.join(directory, 'Scripts/python.exe');
const requirements = fileURLToPath(new URL('../python/requirements.txt', import.meta.url));
async function run(command, parameters) {
  const child = spawn(command, parameters, { cwd: dataRoot, stdio: 'inherit', windowsHide: true });
  await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', (code) => {
    if (code === 0) resolve(); else reject(new Error(`${command} exited with ${code}`));
  }); });
}
await mkdir(dataRoot, { recursive: true });
await run(python, ['-c', 'import sys; assert sys.version_info >= (3, 12), "Python 3.12+ required"']);
let exists = false;
try { exists = (await stat(executable)).isFile(); } catch { /* A new environment is created below. */ }
if (!exists) await run(python, ['-m', 'venv', directory]);
await run(executable, ['-m', 'pip', 'install', '--disable-pip-version-check', '--no-cache-dir', '--no-input', '--requirement', requirements]);
console.log(`Document Converter Python: ${executable}`);
