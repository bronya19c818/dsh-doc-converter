# 发布说明

本包以 npm 分发。DSH 安装插件执行 `dsh plugin --profile web add dsh-doc-converter`，底层是 pnpm add，所以能被安装的前提是包已发布到 npm。

## 发布前检查

```bash
npm ci
npm run build
npm run typecheck
npm test
npm run pack:check
```

`npm publish` 会先自动执行 `scripts/verify-package.mjs`（`prepublishOnly`），确认：

- 包已移除 `private`，`version` 是合法 semver；
- `dsh.bundle.patch` 指向的文件真实存在；
- `cordis.patch.yml` 有 `insert`，且 `name` 等于裸包名；
- `client.js` 的模块 id 与包名一致；
- `index.js` 导出了 `apply`，且没有直接依赖 `@deepseek-ai/*`；
- 声明了 `engines.dsh` 版本门槛。

任一项不满足会中止发布。

## 发布

```bash
npm login
npm view dsh-doc-converter version   # 404 表示名称可用
npm publish --access public
```

本包已用 `npm publish --dry-run` 验证过产物：63 个文件，含入口、`cordis.patch.yml`、`client.js`、51 个 Python 模块与锁定依赖清单。

## 发布后

1. 给 GitHub 仓库加 `dsh-plugin` 话题，这是官方约定的插件发现入口。
2. 到 DSH 插件市场提交页申请收录，收录后用户可在市场搜索并一键安装。
3. 校验安装：在干净 profile 执行 `dsh plugin --profile web add dsh-doc-converter`，重启后确认侧边栏出现「文档转换」。

## 版本与负载

- 发布新版本必须递增 `version`；npm 不允许覆盖已发布版本。
- `python/` 目录是构建产物，转换核心的源码在上游项目。只克隆本仓库也能发布：`npm run build` 在上游源码缺失时会沿用已提交的负载并给出提示。
- 每次发布前确认 `python/requirements.txt` 与上游锁文件一致。

## 许可

当前 `license` 为 `UNLICENSED`（保留所有权利）。若改为开源许可，需要同时补 `LICENSE` 文件并更新 `package.json` 与 README。