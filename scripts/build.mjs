import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, '../src/doc_converter');
const payload = path.join(root, 'python/doc_converter');
const excluded = new Set(['api.py', 'launcher.py', '__main__.py', 'preview_fonts.py', 'web', '__pycache__']);
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const packageName = manifest.name;

const client = await build({
  absWorkingDir: root, entryPoints: ['client/entry.tsx'], bundle: true,
  format: 'cjs', platform: 'browser', target: 'es2022', write: false,
  external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime'],
  loader: { '.css': 'text' }, jsx: 'transform',
  jsxFactory: '__dshReact.createElement', jsxFragment: '__dshReact.Fragment',
  minify: false, metafile: true,
});
const output = client.outputFiles.find((file) => file.path.endsWith('.js')) || client.outputFiles[0];
await writeFile(path.join(root, 'client.js'),
  `window.__ModuleLoader__.load({id:${JSON.stringify(packageName)},factory(require){\nconst __dshReact=require('react');const module={exports:{}};const exports=module.exports;\n${output.text}\nreturn module.exports;\n}});\n`);
await mkdir(payload, { recursive: true });
if (existsSync(source)) {
  // Start from an empty payload so modules removed upstream or newly excluded
  // here cannot survive from an earlier build.
  await rm(payload, { recursive: true, force: true });
  await mkdir(payload, { recursive: true });
  await cp(source, payload, { recursive: true, force: true, filter: (file) => {
    const name = path.basename(file);
    return !excluded.has(name) && (!path.extname(name) || name.endsWith('.py'));
  } });
} else if (existsSync(path.join(payload, '__init__.py'))) {
  // A published checkout carries the copied payload only; publishing does not
  // need the upstream sources, so keep the committed payload and continue.
  console.log('上游转换源码不可用，沿用已提交的 Python 负载。');
} else {
  throw new Error(`缺少转换核心：${source} 与已提交的 ${payload} 都不存在。`);
}

const requirements = ['annotated-types', 'lxml', 'markdown-it-py', 'mdurl', 'pydantic',
  'pydantic-core', 'python-docx', 'pyyaml', 'typing-extensions', 'typing-inspection'];
const lockPath = path.resolve(root, '../uv.lock');
if (existsSync(lockPath)) {
  const lock = await readFile(lockPath, 'utf8');
  const versions = new Map([...lock.matchAll(/\[\[package\]\]\r?\nname = "([^"]+)"\r?\nversion = "([^"]+)"/g)]
    .map((match) => [match[1], match[2]]));
  for (const name of requirements) if (!versions.has(name)) throw new Error(`Missing locked Python dependency: ${name}`);
  await writeFile(path.join(root, 'python/requirements.txt'), requirements.map((name) => `${name}==${versions.get(name)}`).join('\n') + '\n');
} else if (!existsSync(path.join(root, 'python/requirements.txt'))) {
  throw new Error('缺少 python/requirements.txt 依赖锁定文件。');
}

async function files(directory, base = directory) {
  const result = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) result.push(...await files(full, base));
    else result.push(path.relative(base, full).replaceAll('\\', '/'));
  }
  return result.sort();
}
const pythonFiles = await files(payload);
const hashes = {};
for (const relative of pythonFiles) {
  if (!relative.endsWith('.py')) throw new Error(`Unexpected Python payload: ${relative}`);
  hashes[relative] = createHash('sha256').update(await readFile(path.join(payload, relative))).digest('hex');
}
await mkdir(path.join(root, 'artifacts'), { recursive: true });
await writeFile(path.join(root, 'artifacts/build-manifest.json'), JSON.stringify({
  package: JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).version,
  python: hashes, clientBytes: output.contents.length,
  externalImports: Object.values(client.metafile.outputs).flatMap((item) => item.imports.filter((entry) => entry.external).map((entry) => entry.path)),
}, null, 2) + '\n');
console.log(`Built native Client and ${pythonFiles.length} Python modules. Pandoc and LibreOffice are external.`);
