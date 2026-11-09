import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { IconAdjustments, IconAlertCircle, IconCheck, IconDownload, IconExternalLink, IconLoader2, IconPlayerPlay, IconPlayerStop, IconPlus, IconRefresh } from '@tabler/icons-react'

import { artifactUrl, cancelJob, clearToken, convertJob, createStylePack, deleteStylePack, getDependencies, getJob, importFile, importPath, listStylePacks, saveToken, type Dependencies, type Job, type OutputFormat, type StylePack, type TokenStatus } from './api'
import { useText } from './i18n'
import { StyleEditor } from './StyleEditor'
import css from './styles.css'

const JOB_STORAGE_KEY = 'dsh-doc-converter:current-job:v1'
const ACCEPT = '.md,.markdown,.docx,.doc,.png,.jpg,.jpeg,.bmp,.tif,.tiff,.webp,.pdf'
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'bmp', 'tif', 'tiff', 'webp'])

function rememberJob(jobId: string | null) {
  try {
    if (jobId) window.sessionStorage.setItem(JOB_STORAGE_KEY, jobId)
    else window.sessionStorage.removeItem(JOB_STORAGE_KEY)
  } catch { /* Storage can be disabled; the task remains owned by the Host. */ }
}

function rememberedJob(): string | null {
  try { return window.sessionStorage.getItem(JOB_STORAGE_KEY) } catch { return null }
}

function sourceFormat(name: string): 'docx' | 'markdown' | 'doc' | 'image' | 'pdf' | null {
  const suffix = name.trim().toLowerCase().split('.').pop() ?? ''
  if (suffix === 'docx') return 'docx'
  if (suffix === 'doc') return 'doc'
  if (suffix === 'md' || suffix === 'markdown') return 'markdown'
  if (suffix === 'pdf') return 'pdf'
  return IMAGE_EXTENSIONS.has(suffix) ? 'image' : null
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

export function App() {
  const t = useText()
  const id = useId()
  const [packs, setPacks] = useState<StylePack[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [loadingStyles, setLoadingStyles] = useState(true)
  const [stylesError, setStylesError] = useState<string | null>(null)
  const [dependencies, setDependencies] = useState<Dependencies | null>(null)
  const [dependenciesError, setDependenciesError] = useState<string | null>(null)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null)
  const [tokenInput, setTokenInput] = useState('')
  const [tokenBusy, setTokenBusy] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('docx')
  const [cancelling, setCancelling] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [path, setPath] = useState('')
  const [pathMode, setPathMode] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorVisited, setEditorVisited] = useState(false)
  const [editorSection, setEditorSection] = useState<'roles' | 'page'>('roles')
  const [editorDirty, setEditorDirty] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [newPresetOpen, setNewPresetOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [job, setJob] = useState<Job | null>(null)
  const [jobError, setJobError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<'importing' | 'starting' | null>(null)
  const [pollGeneration, setPollGeneration] = useState(0)
  const [restoring, setRestoring] = useState(Boolean(rememberedJob()))
  const nameRef = useRef<HTMLInputElement>(null)
  const starting = useRef(false)

  const selectedPack = packs.find((pack) => pack.id === selectedId) ?? null
  const running = job?.status === 'running'
  const busy = phase !== null || running || restoring
  const sourceName = pathMode ? path.trim() : file?.name ?? ''
  const format = sourceFormat(sourceName)
  const ocrSource = format === 'image' || format === 'pdf'
  const capability = format && !ocrSource ? dependencies?.capabilities?.[format] : undefined
  const needsStyle = !ocrSource || outputFormat === 'docx'
  const tokenReady = Boolean(tokenStatus?.configured)
  const dependencyBlock = ocrSource && dependencies && !tokenReady
    ? t('尚未配置 PaddleOCR 访问令牌，请先在「转换环境」填写。')
    : ocrSource && outputFormat === 'docx' && dependencies?.capabilities?.markdown === false
      ? t('DOCX 输出需要 Pandoc。')
      : !ocrSource && capability === false
        ? format === 'markdown' ? t('尚未找到 Pandoc，Markdown 转换暂不可用。')
          : format === 'doc' ? t('DOC 转换需要 Pandoc 和 LibreOffice。') : null
        : null

  const acceptJob = useCallback((next: Job) => {
    rememberJob(next.id)
    setJob(next)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let active = true
    const stored = rememberedJob()
    async function initialize() {
      const [stylesResult, dependenciesResult, jobResult] = await Promise.allSettled([
        listStylePacks(controller.signal),
        getDependencies(controller.signal),
        stored ? getJob(stored, controller.signal) : Promise.resolve(null),
      ])
      if (!active) return
      if (stylesResult.status === 'fulfilled') {
        setPacks(stylesResult.value)
        const restoredPack = jobResult.status === 'fulfilled' ? jobResult.value?.style_pack_id : undefined
        setSelectedId((current) => current || (stylesResult.value.some((pack) => pack.id === restoredPack) ? restoredPack! : stylesResult.value[0]?.id ?? ''))
      } else {
        setStylesError(errorMessage(stylesResult.reason, t('未能读取样式，请重试。')))
      }
      if (dependenciesResult.status === 'fulfilled') {
        setDependencies(dependenciesResult.value)
        setTokenStatus(dependenciesResult.value.ocr ?? null)
      } else setDependenciesError(errorMessage(dependenciesResult.reason, t('未能读取转换环境，请重试。')))
      if (jobResult.status === 'fulfilled') {
        if (jobResult.value) {
          acceptJob(jobResult.value)
          setOutputFormat(jobResult.value.output_format ?? 'docx')
        }
      } else {
        setJobError(errorMessage(jobResult.reason, t('无法读取任务状态，请重试。')))
      }
      setLoadingStyles(false)
      setRestoring(false)
    }
    void initialize()
    return () => { active = false; controller.abort() }
    // Initialization restores one Host-owned task; locale changes must not reset an edited preset.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptJob])

  useEffect(() => {
    if (!job || job.status !== 'running') return
    const jobId = job.id
    const controller = new AbortController()
    let active = true
    let timer: ReturnType<typeof setTimeout>
    let failures = 0
    async function poll() {
      try {
        const next = await getJob(jobId, controller.signal)
        if (!active) return
        failures = 0
        setJobError(null)
        acceptJob(next)
        if (next.status === 'running') timer = setTimeout(poll, 1200)
      } catch (pollError) {
        if (!active) return
        failures += 1
        setJobError(errorMessage(pollError, t('无法读取任务状态，请重试。')))
        if (failures < 3) timer = setTimeout(poll, 1800 * failures)
      }
    }
    timer = setTimeout(poll, 900)
    return () => { active = false; clearTimeout(timer); controller.abort() }
    // Keep one request in flight; a refreshed running Job must not restart the polling loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status, pollGeneration, acceptJob])

  useEffect(() => {
    if (newPresetOpen) nameRef.current?.focus()
  }, [newPresetOpen])

  async function reloadStyles() {
    setLoadingStyles(true)
    setStylesError(null)
    try {
      const next = await listStylePacks()
      setPacks(next)
      setSelectedId((current) => next.some((pack) => pack.id === current) ? current : next[0]?.id ?? '')
    } catch (loadError) { setStylesError(errorMessage(loadError, t('未能读取样式，请重试。'))) }
    finally { setLoadingStyles(false) }
  }

  async function reloadDependencies() {
    setDependenciesError(null)
    try {
      const next = await getDependencies()
      setDependencies(next)
      setTokenStatus(next.ocr ?? null)
    } catch (loadError) { setDependenciesError(errorMessage(loadError, t('未能读取转换环境，请重试。'))) }
  }

  async function retryJob() {
    setJobError(null)
    const jobId = job?.id ?? rememberedJob()
    if (!jobId) return
    try {
      acceptJob(await getJob(jobId))
      setPollGeneration((current) => current + 1)
    } catch (loadError) { setJobError(errorMessage(loadError, t('无法读取任务状态，请重试。'))) }
  }

  function selectNewSource() {
    setError(null)
    setJobError(null)
    setJob(null)
    setOutputFormat('docx')
    rememberJob(null)
  }

  async function createPreset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (creating || busy || editorDirty || !newName.trim()) return
    setCreating(true)
    setError(null)
    try {
      const pack = await createStylePack({ name: newName.trim() })
      setPacks((current) => [...current, pack])
      setSelectedId(pack.id)
      setNewName('')
      setNewPresetOpen(false)
      setEditorVisited(true)
      setEditorOpen(true)
    } catch (createError) { setError(errorMessage(createError, t('操作未完成，请重试。'))) }
    finally { setCreating(false) }
  }

  function savedPreset(pack: StylePack) {
    setPacks((current) => current.map((item) => item.id === pack.id ? pack : item))
    setEditorDirty(false)
  }

  async function deleteSelectedPreset() {
    if (!selectedPack || busy || creating || deleting) return
    if (!window.confirm(`${t('删除样式')}「${selectedPack.name}」？${t('删除后无法恢复。')}`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteStylePack(selectedPack)
      setPacks((current) => {
        const next = current.filter((item) => item.id !== selectedPack.id)
        setSelectedId(next[0]?.id ?? '')
        return next
      })
      setEditorOpen(false)
      setEditorVisited(false)
      setEditorDirty(false)
    } catch (deleteError) { setError(errorMessage(deleteError, t('操作未完成，请重试。'))) }
    finally { setDeleting(false) }
  }

  async function startConversion() {
    if (starting.current || busy || creating || editorDirty) return
    setError(null)
    setJobError(null)
    if (needsStyle && !selectedPack) { setError(t('请选择样式预设。')); return }
    if (ocrSource && !tokenReady) { setError(t('尚未配置 PaddleOCR 访问令牌，请先在「转换环境」填写。')); return }
    if (dependencyBlock) { setError(dependencyBlock); return }
    const pack = needsStyle ? selectedPack : null
    const resumable = job?.status === 'ready' ? job : null
    if (!resumable && !sourceName) { setError(t('请选择文件或填写本机路径。')); return }
    if (!resumable && !format) { setError(t('仅支持 .md、.markdown、.docx、.doc、图片和 PDF 文件。')); return }
    starting.current = true
    try {
      setPhase(resumable ? 'starting' : 'importing')
      const imported = resumable ?? (pathMode ? await importPath(path.trim(), pack, outputFormat) : await importFile(file!, pack, outputFormat))
      acceptJob(imported)
      setPhase('starting')
      acceptJob(await convertJob(imported.id, pack, imported.output_format ?? outputFormat))
    } catch (convertError) { setError(errorMessage(convertError, t('操作未完成，请重试。'))) }
    finally { starting.current = false; setPhase(null) }
  }

  async function cancelOcrTask() {
    if (!job || cancelling) return
    setCancelling(true)
    setError(null)
    try { acceptJob(await cancelJob(job.id)) }
    catch (cancelError) { setError(errorMessage(cancelError, t('操作未完成，请重试。'))) }
    finally { setCancelling(false) }
  }

  async function saveTokenValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = tokenInput.trim()
    if (!value || tokenBusy) return
    setTokenBusy(true)
    setTokenError(null)
    try {
      setTokenStatus(await saveToken(value))
      setTokenInput('')
    } catch (saveError) { setTokenError(errorMessage(saveError, t('操作未完成，请重试。'))) }
    finally { setTokenBusy(false) }
  }

  async function clearSavedToken() {
    if (tokenBusy) return
    setTokenBusy(true)
    setTokenError(null)
    try { setTokenStatus(await clearToken()) }
    catch (clearError) { setTokenError(errorMessage(clearError, t('操作未完成，请重试。'))) }
    finally { setTokenBusy(false) }
  }

  const ocrProgress = job?.ocr?.total_pages ? `${job.ocr.extracted_pages ?? 0} / ${job.ocr.total_pages}` : null
  const statusText = restoring ? t('正在恢复任务…') : phase === 'importing' ? t('正在导入…') : phase === 'starting' ? t('正在启动…')
    : job?.status === 'running' ? (job.conversion_mode === 'ocr'
      ? job.ocr?.state === 'pending' ? t('排队中')
        : ocrProgress ? `${t('正在识别')} ${ocrProgress} ${t('页')}` : t('正在识别…')
      : t('正在转换…'))
      : job?.status === 'completed' ? t('转换完成')
        : job?.status === 'cancelled' ? t('已取消')
          : job?.status === 'failed' ? t('转换失败') : t('待转换')
  const outputName = job?.output_name
  const primaryArtifact = outputName ? job?.artifacts.find((name) => name === outputName) ?? null : null
  const markdownOutput = job?.output_format === 'markdown'
  const otherArtifacts = job?.artifacts.filter((name) => name !== primaryArtifact) ?? []

  return (
    <section aria-label={t('文档转换')} className="dc-page">
      <style>{css}</style>
      <div className="dc-content">
        <header className="dc-heading"><h1>{t('文档转换')}</h1></header>

        <section aria-labelledby={`${id}-file-title`} className="dc-section">
          <h2 id={`${id}-file-title`}>{t('文件')}</h2>
          {!pathMode ? (
            <>
              <label className="dc-sr-only" htmlFor={`${id}-file`}>{t('选择文件')}</label>
              <input accept={ACCEPT} className="dc-file-input" disabled={busy} id={`${id}-file`} onChange={(event) => {
                const chosen = event.target.files?.[0] ?? null
                selectNewSource()
                setFile(chosen)
                if (chosen && !sourceFormat(chosen.name)) setError(t('仅支持 .md、.markdown、.docx、.doc、图片和 PDF 文件。'))
              }} type="file" />
            </>
          ) : (
            <label className="dc-path-field" htmlFor={`${id}-path`}>
              <span>{t('本机文件路径')}</span>
              <input autoComplete="off" disabled={busy} id={`${id}-path`} onChange={(event) => { selectNewSource(); setPath(event.target.value) }} placeholder={t('转换文件所在 Host 上的完整路径')} type="text" value={path} />
            </label>
          )}
          <div className="dc-source-help"><span>{t('支持 Markdown、DOCX、DOC、图片和 PDF。')}</span><button className="dc-text-button" disabled={busy} onClick={() => { selectNewSource(); setPathMode((current) => !current) }} type="button">{t(pathMode ? '使用文件选择' : '使用本机路径')}</button></div>
          {dependencyBlock ? <p className="dc-warning" role="status">{dependencyBlock}</p> : null}
        </section>

        {ocrSource ? (
          <section aria-labelledby={`${id}-format-title`} className="dc-section">
            <h2 id={`${id}-format-title`}>{t('输出格式')}</h2>
            <div aria-label={t('输出格式')} className="dc-format-options" role="radiogroup">
              {(['docx', 'markdown'] as const).map((value) => (
                <label className={`dc-format-option${outputFormat === value ? ' is-selected' : ''}`} key={value}>
                  <input checked={outputFormat === value} disabled={busy} name={`${id}-format`} onChange={() => setOutputFormat(value)} type="radio" value={value} />
                  <span>{t(value === 'docx' ? 'Word 文档（.docx）' : 'Markdown（.md）')}</span>
                </label>
              ))}
            </div>
          </section>
        ) : null}

        {needsStyle ? (
        <section aria-labelledby={`${id}-style-title`} className="dc-section">
          <h2 id={`${id}-style-title`}>{t('样式预设')}</h2>
          <div className="dc-preset-row">
            <label className="dc-sr-only" htmlFor={`${id}-preset`}>{t('选择样式预设')}</label>
            <select disabled={busy || creating || editorDirty || loadingStyles || !packs.length} id={`${id}-preset`} onChange={(event) => setSelectedId(event.target.value)} value={selectedId}>
              {!packs.length ? <option value="">{t(loadingStyles ? '正在读取样式…' : '选择样式预设')}</option> : null}
              {packs.map((pack) => <option key={pack.id} value={pack.id}>{pack.name} · v{pack.version}</option>)}
            </select>
            <button aria-controls={`${id}-new-preset`} aria-expanded={newPresetOpen} className="dc-button" disabled={busy || creating || editorDirty} onClick={() => setNewPresetOpen((current) => !current)} type="button"><IconPlus aria-hidden="true" size={17} />{t('创建预设')}</button>
            <button aria-controls={`${id}-editor`} aria-expanded={editorOpen} className="dc-button" disabled={!selectedPack} onClick={() => { setEditorVisited(true); setEditorOpen((current) => !current) }} type="button"><IconAdjustments aria-hidden="true" size={17} />{t(editorOpen ? '收起样式设置' : '展开样式设置')}</button>
          </div>
          {stylesError ? <div className="dc-inline-error" role="alert"><span>{stylesError}</span><button className="dc-text-button" disabled={loadingStyles || busy || editorDirty} onClick={() => void reloadStyles()} type="button">{t('重试')}</button></div> : null}
          {!loadingStyles && !stylesError && !packs.length ? <p className="dc-muted">{t('尚无样式预设。创建一个预设后即可转换。')}</p> : null}
          {newPresetOpen ? (
            <form className="dc-new-preset" id={`${id}-new-preset`} onSubmit={createPreset}>
              <label htmlFor={`${id}-new-name`}>{t('预设名称')}</label>
              <div><input disabled={creating || busy || editorDirty} id={`${id}-new-name`} maxLength={80} onChange={(event) => setNewName(event.target.value)} ref={nameRef} required value={newName} /><button className="dc-button" disabled={creating || busy || editorDirty || !newName.trim()} type="submit">{t(creating ? '正在创建…' : '创建')}</button><button className="dc-text-button" disabled={creating} onClick={() => setNewPresetOpen(false)} type="button">{t('取消')}</button></div>
            </form>
          ) : null}
          {editorDirty ? <p className="dc-warning" role="status">{t('样式有未保存的修改，请先保存新版本。')}</p> : null}
          <div className="dc-style-settings" hidden={!editorOpen} id={`${id}-editor`}>
            {editorVisited && selectedPack ? (
              <>
                <div aria-label={t('展开样式设置')} className="dc-settings-tabs" role="tablist">
                  {(['roles', 'page'] as const).map((section, index) => (
                    <button aria-controls={`${id}-settings-content`} aria-selected={editorSection === section} id={`${id}-settings-${section}`} key={section} onClick={() => setEditorSection(section)} onKeyDown={(event) => {
                      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
                      event.preventDefault()
                      const next = event.key === 'Home' ? 'roles' : event.key === 'End' ? 'page' : index === 0 ? 'page' : 'roles'
                      setEditorSection(next)
                      event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#${CSS.escape(`${id}-settings-${next}`)}`)?.focus()
                    }} role="tab" tabIndex={editorSection === section ? 0 : -1} type="button">{t(section === 'roles' ? '样式角色' : '页面设置')}</button>
                  ))}
                </div>
                <div aria-labelledby={`${id}-settings-${editorSection}`} id={`${id}-settings-content`} role="tabpanel"><StyleEditor disabled={busy || creating || deleting} onDelete={() => void deleteSelectedPreset()} onDirtyChange={setEditorDirty} onSaved={savedPreset} pack={selectedPack} section={editorSection} /></div>
              </>
            ) : null}
          </div>
        </section>
        ) : null}

        <div className="dc-convert-row"><button className="dc-button dc-button-primary" disabled={busy || creating || editorDirty || (needsStyle && !selectedPack) || Boolean(dependencyBlock) || (!sourceName && job?.status !== 'ready')} onClick={() => void startConversion()} type="button">{busy ? <IconLoader2 aria-hidden="true" className="dc-spinner" size={18} /> : <IconPlayerPlay aria-hidden="true" size={18} />}{t(phase === 'importing' ? '正在导入…' : phase === 'starting' ? '正在启动…' : running ? (job?.conversion_mode === 'ocr' ? '正在识别…' : '正在转换…') : '开始转换')}</button></div>
        {error ? <p className="dc-error" role="alert"><IconAlertCircle aria-hidden="true" size={18} />{error}</p> : null}

        {job || restoring || jobError || phase ? (
          <section aria-labelledby={`${id}-job-title`} className="dc-task">
            <div className="dc-task-heading"><h2 id={`${id}-job-title`}>{t('当前任务')}</h2><span className={`dc-status dc-status-${job?.status ?? 'ready'}`} role="status">{job?.status === 'completed' ? <IconCheck aria-hidden="true" size={16} /> : job?.status === 'failed' ? <IconAlertCircle aria-hidden="true" size={16} /> : running || phase || restoring ? <IconLoader2 aria-hidden="true" className="dc-spinner" size={16} /> : null}{statusText}</span></div>
            {job ? <p className="dc-task-name">{job.source_name}<span>{markdownOutput ? 'Markdown' : `DOCX · ${t('版本')} ${job.style_pack_version}`}</span></p> : null}
            {running ? <p className="dc-muted">{t('当前任务已在后台运行，切换页面后可继续查看状态。')}</p> : null}
            {running && job?.conversion_mode === 'ocr' ? <div className="dc-task-actions"><button className="dc-button dc-button-danger" disabled={cancelling} onClick={() => void cancelOcrTask()} type="button">{cancelling ? <IconLoader2 aria-hidden="true" className="dc-spinner" size={17} /> : <IconPlayerStop aria-hidden="true" size={17} />}{t('取消任务')}</button></div> : null}
            {job?.status === 'cancelled' ? <p className="dc-muted">{t('任务已取消，可重新选择文件开始。')}</p> : null}
            {job?.status === 'failed' && job.error ? <p className="dc-error" role="alert">{job.error}</p> : null}
            {jobError ? <div className="dc-inline-error" role="alert"><span>{jobError}</span><button className="dc-text-button" onClick={() => void retryJob()} type="button"><IconRefresh aria-hidden="true" size={16} />{t('重试状态查询')}</button></div> : null}
            {job?.status === 'completed' ? (
              <>
                <div className="dc-result-actions">
                  {primaryArtifact ? <a className="dc-button dc-button-primary" download href={artifactUrl(job.id, primaryArtifact)}><IconDownload aria-hidden="true" size={17} />{t(markdownOutput ? '下载 Markdown 压缩包' : '下载 DOCX')}</a> : null}
                </div>
                {otherArtifacts.length ? <details className="dc-artifacts"><summary>{t('其他产物')}</summary><ul>{otherArtifacts.map((name) => <li key={name}><a download href={artifactUrl(job.id, name)}><IconDownload aria-hidden="true" size={15} /><span>{name}</span></a></li>)}</ul></details> : null}
              </>
            ) : null}
          </section>
        ) : null}

        <details className="dc-environment">
          <summary>{t('转换环境')}</summary>
          {dependencies ? <dl>{(['pandoc', 'libreoffice'] as const).map((key) => <div key={key}><dt>{key === 'pandoc' ? 'Pandoc' : 'LibreOffice'}</dt><dd>{t(dependencies[key]?.available ? '已找到' : '未找到')}{dependencies[key]?.path ? <span className="dc-dependency-path">{dependencies[key]!.path}</span> : null}</dd></div>)}</dl> : null}
          {dependenciesError ? <p className="dc-error" role="alert">{dependenciesError}</p> : null}
          <div className="dc-token">
            <div className="dc-token-heading"><span>{t('PaddleOCR 访问令牌')}</span><a href="https://aistudio.baidu.com/account/accessToken" rel="noreferrer" target="_blank">{t('申请令牌')}<IconExternalLink aria-hidden="true" size={14} /></a></div>
            <p className="dc-muted">{tokenStatus?.configured ? `${t('已配置')}${tokenStatus.hint ? `（${tokenStatus.hint}）` : ''}` : t('未配置')}{tokenStatus?.source === 'environment' ? ` · ${t('由环境变量提供')}` : ''}</p>
            <form className="dc-token-row" onSubmit={saveTokenValue}>
              <label className="dc-sr-only" htmlFor={`${id}-token`}>{t('访问令牌')}</label>
              <input autoComplete="off" disabled={busy || tokenBusy} id={`${id}-token`} onChange={(event) => setTokenInput(event.target.value)} placeholder={t(tokenStatus?.configured ? '粘贴新令牌以替换' : '粘贴访问令牌')} type="password" value={tokenInput} />
              <button className="dc-button" disabled={busy || tokenBusy || !tokenInput.trim()} type="submit">{t(tokenBusy ? '正在保存…' : '保存令牌')}</button>
              {tokenStatus?.source === 'file' ? <button className="dc-text-button" disabled={busy || tokenBusy} onClick={() => void clearSavedToken()} type="button">{t('清除')}</button> : null}
            </form>
            {tokenStatus?.source === 'environment' ? <p className="dc-muted">{t('当前令牌由环境变量提供，保存的值不会覆盖它。')}</p> : null}
            {tokenError ? <p className="dc-error" role="alert">{tokenError}</p> : null}
          </div>
          <button className="dc-text-button" onClick={() => void reloadDependencies()} type="button"><IconRefresh aria-hidden="true" size={15} />{t('刷新环境')}</button>
        </details>
      </div>
    </section>
  )
}
