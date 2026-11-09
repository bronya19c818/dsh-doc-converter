# OCR 产物进入现有规范化层，Markdown 与 DOCX 共用同一份内容

PaddleOCR 返回的是带版面结构的 Markdown，图片是 HTML 块而不是 Markdown 语法；插件已经有一套为 DOCX 服务的解析层（标题层级、元数据、表格、图片）。决定让 OCR 产物先转成标准 Markdown 图片语法，再进入同一套规范化层，Markdown 交付写规范化结果，DOCX 从同一份结果继续渲染。这样两种输出不会各有一套内容判断，插件的既有规则对 OCR 来源同样生效。

## Considered Options

- 直接交付 OCR 原文：改动小，但 Markdown 与 DOCX 会分叉，图片块还需要 DOCX 路径单独处理。
- 为 OCR 单独做一套轻量清理：会出现第三套规则，后续难以保持一致。

## Consequences

- OCR 的标题推断、front matter 生成会出现在 Markdown 交付物里。
- OCR 图片必须转成 Markdown 语法，否则 Pandoc 渲染 DOCX 时会丢图。