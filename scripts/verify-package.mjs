#!/usr/bin/env node
/**
 * Pre-publish gate for the npm bundle.
 *
 * DSH recognises a plugin by ``dsh.bundle.patch``; it then installs the package
 * and applies that patch layer. Declaring a path that is missing, or a patch row
 * that names anything other than the package itself, installs as "not a plugin"
 * or silently mounts nothing. This script fails the publish unless every claim
 * in package.json resolves to a real file in the tarball.
 */

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const problems = [];

const required = [
  'index.js',
  'client.js',
  'cordis.patch.yml',
  'icon.svg',
  'locale/zh.json',
  'locale/en.json',
  'python/requirements.txt',
  'python/doc_converter/__init__.py',
  'python/doc_converter/worker.py',
  'scripts/setup-python.mjs',
];
for (const relative of required) {
  if (!existsSync(path.join(root, relative))) problems.push(`缺少文件：${relative}`);
}

if (manifest.private === true) problems.push('package.json 仍是 private，npm 会拒绝发布。');

if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(manifest.version ?? '')) {
  problems.push(`version 不是合法 semver：${manifest.version}`);
}

const patchPath = manifest.dsh?.bundle?.patch;
if (typeof patchPath !== 'string') {
  problems.push('缺少 dsh.bundle.patch，安装端会判定为普通 npm 包。');
} else if (!existsSync(path.join(root, patchPath))) {
  problems.push(`dsh.bundle.patch 指向的文件不存在：${patchPath}`);
}

if (manifest.dsh?.client?.platform !== 'web') {
  problems.push('缺少 dsh.client.platform = "web"，浏览器半区不会被加载。');
}

const patch = existsSync(path.join(root, 'cordis.patch.yml'))
  ? await readFile(path.join(root, 'cordis.patch.yml'), 'utf8')
  : '';
if (!/^\s*-?\s*insert:/m.test(patch)) {
  problems.push('cordis.patch.yml 没有 insert，安装后不会挂载任何内容。');
}
const inserted = [...patch.matchAll(/^\s*(?:-\s+)?name:\s*(.+)$/gm)]
  .map((match) => match[1].trim().replace(/^['"]|['"]$/g, ''));
if (!inserted.length) problems.push('cordis.patch.yml 没有声明插件行 name。');
for (const name of inserted) {
  if (name !== manifest.name) {
    problems.push(`cordis.patch.yml 的 name 必须是裸包名 ${manifest.name}，当前为 ${name}`);
  }
}

const client = existsSync(path.join(root, 'client.js'))
  ? await readFile(path.join(root, 'client.js'), 'utf8')
  : '';
const loaderId = /__ModuleLoader__\.load\(\{id:\s*['"]([^'"]+)['"]/.exec(client)?.[1];
if (loaderId !== manifest.name) {
  problems.push(`client.js 的模块 id 应为 ${manifest.name}，当前为 ${loaderId ?? '缺失'}`);
}

const entry = existsSync(path.join(root, 'index.js')) ? await readFile(path.join(root, 'index.js'), 'utf8') : '';
if (!/export\s+(?:async\s+)?function\s+apply/.test(entry)) {
  problems.push('index.js 没有导出 apply，Cordis 无法挂载插件。');
}
if (/from\s+['"]@deepseek-ai\//.test(entry)) {
  problems.push('index.js 直接依赖 @deepseek-ai/* 包；官方包应由 profile 注入，不应写进 dependencies。');
}

if (!manifest.engines?.dsh) problems.push('缺少 engines.dsh 版本门槛，旧版 DSH 会尝试加载不兼容插件。');

if (problems.length) {
  console.error('发布前检查未通过：');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}
console.log(`发布前检查通过：${manifest.name}@${manifest.version}`);