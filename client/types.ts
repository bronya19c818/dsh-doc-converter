export type OutputFormat = 'markdown' | 'docx'

export type StylePack = {
  id: string
  name: string
  format_id: string
  version: number
  roles: Record<string, Record<string, unknown>>
}

export type OcrState = {
  job_id?: string
  state: 'pending' | 'running' | 'done' | 'failed' | 'cancelled'
  total_pages: number | null
  extracted_pages: number | null
  pages?: number | null
  images?: number | null
  error?: string | null
}

export type Job = {
  id: string
  status: 'ready' | 'running' | 'completed' | 'failed' | 'cancelled'
  source_name: string
  source_format: string
  output_format?: OutputFormat
  conversion_mode?: 'round-trip' | 'docx-direct' | 'ocr'
  style_pack_id: string | null
  style_pack_version: number | null
  artifacts: string[]
  output_name: string | null
  error: string | null
  ocr?: OcrState | null
}

export type TokenStatus = {
  configured: boolean
  source: 'file' | 'environment' | null
  hint: string | null
}

export type Dependencies = {
  pandoc?: { available: boolean; path?: string }
  libreoffice?: { available: boolean; path?: string }
  ocr?: TokenStatus
  capabilities?: { docx?: boolean; markdown?: boolean; doc?: boolean }
  [key: string]: unknown
}

export type RpcResponse<T> =
  | { ok: true; result: T }
  | { ok: false; error: { code: string; message: string } }