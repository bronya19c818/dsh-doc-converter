import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'

const TEXT: Record<string, string> = {
  '文档转换': 'Document conversion',
  '文件': 'File',
  '选择文件': 'Choose file',
  '未选择文件': 'No file selected',
  '支持 Markdown、DOCX 和 DOC。': 'Markdown, DOCX and DOC are supported.',
  '使用本机路径': 'Use a local path',
  '本机文件路径': 'Local file path',
  '转换文件所在 Host 上的完整路径': 'Full path on the Host performing the conversion',
  '使用文件选择': 'Choose a file instead',
  '样式预设': 'Style preset',
  '选择样式预设': 'Choose a style preset',
  '正在读取样式…': 'Loading styles…',
  '尚无样式预设。创建一个预设后即可转换。': 'Create a style preset to start converting documents.',
  '创建预设': 'Create preset',
  '预设名称': 'Preset name',
  '创建': 'Create',
  '正在创建…': 'Creating…',
  '取消': 'Cancel',
  '展开样式设置': 'Edit styles',
  '收起样式设置': 'Collapse style settings',
  '样式角色': 'Style roles',
  '页面设置': 'Page setup',
  '保存样式新版本': 'Save new style version',
  '删除此样式': 'Delete this style',
  '删除样式': 'Delete style',
  '删除后无法恢复。': 'This cannot be undone.',
  '正在保存…': 'Saving…',
  '样式保存失败。': 'The style could not be saved.',
  '已保存': 'Saved',
  '版本': 'Version',
  '样式有未保存的修改，请先保存新版本。': 'Save the edited style as a new version before continuing.',
  '开始转换': 'Start conversion',
  '正在导入…': 'Importing…',
  '正在启动…': 'Starting…',
  '正在恢复任务…': 'Restoring task…',
  '正在转换…': 'Converting…',
  '待转换': 'Ready',
  '转换完成': 'Completed',
  '转换失败': 'Failed',
  '当前任务': 'Current task',
  '下载 DOCX': 'Download DOCX',
  '其他产物': 'Other files',
  '重试': 'Retry',
  '重试状态查询': 'Retry status check',
  '转换环境': 'Conversion environment',
  '已找到': 'Available',
  '未找到': 'Not found',
  '未能读取转换环境，请重试。': 'The conversion environment could not be checked. Please retry.',
  '刷新环境': 'Refresh environment',
  '尚未找到 Pandoc，Markdown 转换暂不可用。': 'Pandoc was not found. Markdown conversion is unavailable.',
  'DOC 转换需要 Pandoc 和 LibreOffice。': 'DOC conversion requires Pandoc and LibreOffice.',
  '仅支持 .md、.markdown、.docx 和 .doc 文件。': 'Choose an .md, .markdown, .docx or .doc file.',
  '请选择文件或填写本机路径。': 'Choose a file or enter a local path.',
  '请选择样式预设。': 'Choose a style preset.',
  '无法读取任务状态，请重试。': 'The task status could not be loaded. Please retry.',
  '操作未完成，请重试。': 'The operation could not be completed. Please retry.',
  '未能读取样式，请重试。': 'Styles could not be loaded. Please retry.',
  '当前任务已在后台运行，切换页面后可继续查看状态。': 'This task runs in the background. Its status is restored when you return.',
  '样式角色分区': 'Style sections',
  '样式目录': 'Style roles',
  '文前部分': 'Front matter',
  '正文部分': 'Main text',
  '文后部分': 'Back matter',
  '标题与元数据': 'Title and metadata',
  '摘要': 'Abstract',
  '关键词': 'Keywords',
  '标题层级': 'Headings',
  '正文': 'Body',
  '表格': 'Tables',
  '图片': 'Images',
  '参考文献（检测到“参考文献”标题后生效）': 'References (after a references heading)',
  '文档标题': 'Document title',
  '副标题': 'Subtitle',
  '单位/部门': 'Organization / department',
  '作者': 'Author',
  '日期': 'Date',
  '摘要标签': 'Abstract label',
  '摘要内容': 'Abstract text',
  '关键词标签': 'Keywords label',
  '关键词内容': 'Keywords text',
  '一级标题': 'Heading 1',
  '二级标题': 'Heading 2',
  '三级标题': 'Heading 3',
  '四级标题': 'Heading 4',
  '五级标题': 'Heading 5',
  '六级标题': 'Heading 6',
  '段落正文': 'Body paragraph',
  '表格正文': 'Table body',
  '要点': 'Emphasis',
  '表格标题': 'Table caption',
  '制表人': 'Table credit',
  '行标题': 'Row heading',
  '列标题': 'Column heading',
  '图片标题': 'Figure caption',
  '制图人': 'Figure credit',
  '图片样式': 'Image style',
  '参考文献标题': 'References heading',
  '参考文献条目': 'Reference entry',
  '页脚': 'Footer',
  '中文字体': 'Chinese font',
  '西文字体': 'Western font',
  '字号': 'Font size',
  '粗体': 'Bold',
  '斜体': 'Italic',
  '对齐': 'Alignment',
  '左对齐': 'Left',
  '居中': 'Center',
  '右对齐': 'Right',
  '两端对齐': 'Justify',
  '最大宽度（厘米）': 'Maximum width (cm)',
  '按正文宽度适配': 'Fit the body width',
  '留空时按正文宽度适配，较小图片不会放大。': 'Leave empty to fit the body width. Smaller images are not enlarged.',
  '首行缩进': 'First-line indent',
  '左缩进': 'Left indent',
  '右缩进': 'Right indent',
  '段前（磅）': 'Space before (pt)',
  '段后（磅）': 'Space after (pt)',
  '单位': 'Unit',
  '字符': 'Characters',
  '磅': 'pt',
  '厘米': 'cm',
  '行距': 'Line spacing',
  '行距类型': 'Line spacing rule',
  '行距（倍数）': 'Line spacing (multiple)',
  '行距（磅）': 'Line spacing (pt)',
  '最大值': 'Maximum',
  '最小值': 'Minimum',
  '固定值': 'Exactly',
  '多倍': 'Multiple',
  '自定义': 'Custom',
  '初号': 'Initial',
  '小初': 'Small initial',
  '一号': 'No. 1',
  '小一': 'Small No. 1',
  '二号': 'No. 2',
  '小二': 'Small No. 2',
  '三号': 'No. 3',
  '小三': 'Small No. 3',
  '四号': 'No. 4',
  '小四': 'Small No. 4',
  '五号': 'No. 5',
  '小五': 'Small No. 5',
  '六号': 'No. 6',
  '小六': 'Small No. 6',
  '七号': 'No. 7',
  '八号': 'No. 8',
  '上边距（厘米）': 'Top margin (cm)',
  '下边距（厘米）': 'Bottom margin (cm)',
  '左边距（厘米）': 'Left margin (cm)',
  '右边距（厘米）': 'Right margin (cm)',
  '纸张大小': 'Paper size',
  '16 开': '16K',
}

const entries = Object.entries(TEXT)
const keys = new Map(entries.map(([source], index) => [source, `message${index}`]))
export const dictionaries = {
  zh: Object.fromEntries(entries.map(([source], index) => [`message${index}`, source])),
  en: Object.fromEntries(entries.map(([, translated], index) => [`message${index}`, translated])),
}

export type LocaleSnapshot = {
  active: string
  locales: Array<{ id: string; label: string; fallback?: string }>
  revision: number
}

export type LocaleSource = {
  subscribe: (listener: () => void) => () => void
  getSnapshot: () => LocaleSnapshot
  translate: (key: string) => string
}

export type TextTranslator = (source: string) => string
const TextContext = createContext<TextTranslator>((source) => source)

export function createTextTranslator(translate: LocaleSource['translate']): TextTranslator {
  const prefixes = entries.map(([source]) => source).sort((a, b) => b.length - a.length)
  const resolve: TextTranslator = (source) => {
    const key = keys.get(source)
    if (key) return translate(key)
    for (const prefix of prefixes) {
      if (source.length > prefix.length && source.startsWith(prefix)) {
        const suffix = source.slice(prefix.length)
        const translatedPrefix = resolve(prefix)
        const translatedSuffix = resolve(suffix)
        if (translatedPrefix !== prefix || translatedSuffix !== suffix) return `${translatedPrefix} ${translatedSuffix}`
      }
    }
    return source
  }
  return resolve
}

export function I18nProvider({ source, children }: { source: LocaleSource; children: ReactNode }) {
  const snapshot = useSyncExternalStore(source.subscribe, source.getSnapshot, source.getSnapshot)
  const text = useMemo(() => createTextTranslator(source.translate), [source, snapshot.active, snapshot.revision])
  return <TextContext.Provider value={text}>{children}</TextContext.Provider>
}

export function useText(): TextTranslator {
  return useContext(TextContext)
}
