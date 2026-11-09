# DSH 文档转换

DeepSeek Harness 原生插件。本地完成 Markdown、DOCX、DOC 到 DOCX 的转换，样式按不可变版本保存；图片和 PDF 走 PaddleOCR 云端识别，再按 Markdown 或 DOCX 交付。除 OCR 上传识别外，转换全程没有模型参与。

## 功能

导入一份 `.md`、`.markdown`、`.docx`、`.doc`、图片或 PDF，按输出格式生成产物并下载；同时产出规范化报告，DOCX 还会保存样式快照，便于复核。

- 原生侧边栏页面和 `doc_converter` 工具调用同一组后端操作。
- 图片和 PDF 可选输出 Markdown 或 DOCX；选 DOCX 时在同一任务内先得到规范化 Markdown，再自动渲染。Markdown 不绑定样式，DOCX 需要样式预设。
- OCR 接受 PNG、JPG、JPEG、BMP、TIF、TIFF、WEBP 和 PDF；单文件 50 MB、单张图片 10 MB、PDF 最多 1000 页，超出会被拦下。
- Markdown 交付为压缩包，内含规范化 Markdown 与 `images/` 目录；图片按页存放，正文使用相对路径引用。
- 云端识别期间显示排队与已处理页数，可取消；取消只停止本地等待，不撤回云端任务。
- 样式预设分角色设置（标题、正文、表格、图片、页边距等），保存时生成新版本，旧版本保持可追溯。
- 当前有效样式可从旧数据目录一次性迁移，身份、版本和原始字段不变。
- Markdown 的标题层级由后端统一判定；`*`、`^` 这类与算式冲突的符号按上下文评分决定是否作为强调或上标，判定结果写入报告。
- DOCX 直接走 OOXML 规范化，不重建内容；只有显式指定时才走 Markdown 重建。

## 运行条件

- Windows。宿主为 DeepSeek Harness，`engines.dsh` 要求 `>=0.2.1-rc.5`。
- Python 3.12 或更新版本，用于插件自己的转换进程。
- Pandoc 用于 Markdown 与 DOC 转换，LibreOffice 仅 DOC 转换需要。两者都由插件在执行端探测并调用，包内不分发。
- OCR 需要网络和 PaddleOCR 访问令牌，在页面「转换环境」填写，或通过环境变量 `DOC_CONVERTER_PADDLE_TOKEN` 提供。

只转换 DOCX 时不需要外部程序；只输出 Markdown 的 OCR 任务不需要 Pandoc。

## 安装

```bash
dsh plugin --profile web add dsh-doc-converter
```

安装后重启 DSH，侧边栏出现「文档转换」。

## 首次使用：准备私有 Python 环境

插件在自己的数据根下建一个私有 `venv`，不与系统 Python 混用。用装好包内的准备脚本执行一次：

```bash
node <DSH_HOME>/profiles/web/node_modules/dsh-doc-converter/scripts/setup-python.mjs \
  --python <Python 3.12+ 可执行文件绝对路径> \
  --data-root <DSH_HOME>/storages/dsh-doc-converter
```

依赖版本来自包内 `python/requirements.txt` 的锁定列表。准备完成后，页面「转换环境」会显示 Python、Pandoc、LibreOffice 的探测结果。

也可以在 Host 配置里显式提供 `pythonPath` 和 `dataRoot`，此时使用执行端的绝对路径。

## 使用

文档输入：选文件、选预设、开始转换。转换在后台跑，切换页面后回来仍能看到进度和结果。完成后下载 DOCX，其他产物在「其他产物」里。

图片或 PDF：选文件后多出「输出格式」。选 Markdown 不选样式，完成后下载 Markdown 压缩包；选 Word 文档则照常选预设，OCR 结果先转成规范化 Markdown，再自动生成 DOCX。识别期间显示排队和页数，可以取消。

工具调用序列与页面一致：

```text
import_file（带 output_format）-> convert -> get_job（直到 completed/failed/cancelled）-> artifact
```

可选动作：`cancel`、`dependencies`、`list_styles`、`create_style`、`revise_style`、`delete_style`、`migrate_styles`。

## 数据位置

默认在 `$DSH_HOME/storages/dsh-doc-converter`：

- `jobs/<id>/source/` 原始输入副本，不覆盖上传文件
- `jobs/<id>/images/` OCR 下载的分页图片
- `jobs/<id>/` 正式产物与审计文件
- `style-packs/<id>/<version>.json` 不可变样式版本
- `paddle-ocr.json` 本机保存的 OCR 访问令牌

同一个数据根只由一个工作进程写入。

## 开发

插件源码在本仓库根目录；转换核心的源码在上游项目，构建时复制到 `python/doc_converter`。

```bash
npm install
npm run build      # 生成 client.js 与 Python 负载
npm run typecheck
npm test
node scripts/verify-package.mjs   # 发布前检查
```

图标为本项目原创；页面功能图标使用 MIT 许可的 Tabler Icons，全文见 `THIRD_PARTY_NOTICES.txt`。

## 许可

MIT，见 `LICENSE`。随包使用的第三方组件许可见 `THIRD_PARTY_NOTICES.txt`。