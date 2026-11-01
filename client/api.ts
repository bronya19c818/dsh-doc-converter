import type { Dependencies, Job, RpcResponse, StylePack } from './types'

export type { Dependencies, Job, StylePack } from './types'

const ROOT = '/api/dsh-doc-converter'

export class ApiError extends Error {
  constructor(message: string, readonly code: string) {
    const missingPythonDependency = message.startsWith('文档转换工作进程已退出。')
      && message.includes('Traceback (most recent call last):')
      && /\bModuleNotFoundError:\s*No module named\b/.test(message)
    super(missingPythonDependency
      ? '转换依赖尚未准备好，请先完成本实例的 Python 环境准备后重试。'
      : message)
    this.name = 'ApiError'
  }
}

async function unwrap<T>(response: Response): Promise<T> {
  let payload: RpcResponse<T>
  try {
    payload = await response.json() as RpcResponse<T>
  } catch {
    throw new ApiError(`服务返回了无法读取的响应（HTTP ${response.status}）。`, 'INVALID_RESPONSE')
  }
  if (payload && payload.ok === false) {
    throw new ApiError(payload.error?.message || '操作未完成，请重试。', payload.error?.code || 'REQUEST_FAILED')
  }
  if (!response.ok || !payload || payload.ok !== true) {
    throw new ApiError(`请求未完成（HTTP ${response.status}）。`, 'HTTP_ERROR')
  }
  return payload.result
}

export async function rpc<T>(action: string, params: Record<string, unknown> = {}, signal?: AbortSignal): Promise<T> {
  return unwrap<T>(await fetch(`${ROOT}/rpc`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ action, params }),
    cache: 'no-store',
    signal,
  }))
}

export function listStylePacks(signal?: AbortSignal): Promise<StylePack[]> {
  return rpc('list_styles', {}, signal)
}

export function createStylePack(payload: { name: string; roles?: StylePack['roles'] }): Promise<StylePack> {
  return rpc('create_style', payload)
}

export function reviseStylePack(pack: StylePack, payload: { name: string; roles: StylePack['roles'] }): Promise<StylePack> {
  return rpc('revise_style', { id: pack.id, base_version: pack.version, ...payload })
}

export function getDependencies(signal?: AbortSignal): Promise<Dependencies> {
  return rpc('dependencies', {}, signal)
}

export async function importFile(file: File, pack: StylePack, signal?: AbortSignal): Promise<Job> {
  const data = new FormData()
  data.append('file', file)
  data.append('style_pack_id', pack.id)
  data.append('style_pack_version', String(pack.version))
  return unwrap<Job>(await fetch(`${ROOT}/import`, {
    method: 'POST', credentials: 'same-origin', body: data, signal,
  }))
}

export function importPath(sourcePath: string, pack: StylePack): Promise<Job> {
  return rpc('import_file', {
    source_path: sourcePath,
    style_pack_id: pack.id,
    style_pack_version: pack.version,
  })
}

export function convertJob(jobId: string, pack: StylePack): Promise<Job> {
  return rpc('convert', { job_id: jobId, style_pack_id: pack.id, style_pack_version: pack.version })
}

export function getJob(jobId: string, signal?: AbortSignal): Promise<Job> {
  return rpc('get_job', { job_id: jobId }, signal)
}

export function artifactUrl(jobId: string, name: string): string {
  return `${ROOT}/artifact?${new URLSearchParams({ job_id: jobId, name }).toString()}`
}
