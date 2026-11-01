import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const source = path.resolve(root, '../src/doc_converter');
const payload = path.join(root, 'python/doc_converter');
const excluded = new Set(['api.py', 'launcher.py', '__main__.py', 'web', '__pycache__']);

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
  `window.__ModuleLoader__.load({id:'dsh-doc-converter',factory(require){\nconst __dshReact=require('react');const module={exports:{}};const exports=module.exports;\n${output.text}\nreturn module.exports;\n}});\n`);
await mkdir(payload, { recursive: true });
await cp(source, payload, { recursive: true, filter: (file) => {
  const name = path.basename(file);
  return !excluded.has(name) && (!path.extname(name) || name.endsWith('.py'));
} });

const lock = await readFile(path.resolve(root, '../uv.lock'), 'utf8');
const versions = new Map([...lock.matchAll(/\[\[package\]\]\r?\nname = "([^"]+)"\r?\nversion = "([^"]+)"/g)]
  .map((match) => [match[1], match[2]]));
const requirements = ['annotated-types', 'lxml', 'markdown-it-py', 'mdurl', 'pydantic',
  'pydantic-core', 'python-docx', 'pyyaml', 'typing-extensions', 'typing-inspection'];
for (const name of requirements) if (!versions.has(name)) throw new Error(`Missing locked Python dependency: ${name}`);
await writeFile(path.join(root, 'python/requirements.txt'), requirements.map((name) => `${name}==${versions.get(name)}`).join('\n') + '\n');

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
