# 文档转换

把本机文件转换成 Markdown 或带版式的 Word 文档的插件，界面与 Agent 工具共用同一套转换能力。

## Language

**输出格式**:
一次转换最终交付的文档类型，只有 `markdown` 与 `docx` 两种。
_Avoid_: 导出格式、目标格式、doc/docx

**规范化 Markdown**:
经插件解析层处理后的 Markdown，是 DOCX 渲染与 Markdown 交付共用的同一份内容。
_Avoid_: 中间稿、工作稿、清理后的 Markdown

**样式预设**:
一套按角色定义、按版本保存且不可变的版式配置；只有 `docx` 输出使用。
_Avoid_: 模板、样式模板、主题

**转换任务**:
一次导入加一次转换的工作单元，带有来源文件、输出格式与状态。
_Avoid_: 转换记录、批次

**OCR 转换**:
以图片或 PDF 为输入，由云端 OCR 产生内容，再按输出格式交付的转换；选 DOCX 时先得到规范化 Markdown 再自动渲染。
_Avoid_: 图片转文档、扫描件识别

**Markdown 交付包**:
Markdown 输出时交付的压缩包，内含规范化 Markdown 与随文图片。
_Avoid_: 导出包、md 包

**OCR 访问令牌**:
调用 PaddleOCR 云端服务所需的账户凭证，由用户在本机填写。
_Avoid_: API Key、密钥

**转换环境**:
页面上显示本机依赖探测结果与 OCR 访问令牌配置的区域。
_Avoid_: 环境配置、系统设置