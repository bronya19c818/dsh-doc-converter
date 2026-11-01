export type StylePack = {
  id: string
  name: string
  format_id: string
  version: number
  roles: Record<string, Record<string, unknown>>
}

export type Job = {
  id: string
  status: 'ready' | 'running' | 'completed' | 'failed'
  source_name: string
  source_format: string
  conversion_mode?: 'round-trip' | 'docx-direct'
  style_pack_id: string
  style_pack_version: number
  artifacts: string[]
  output_name: string | null
  error: string | null
}

export type Dependencies = {
  pandoc?: { available: boolean; path?: string }
  libreoffice?: { available: boolean; path?: string }
  capabilities?: { docx?: boolean; markdown?: boolean; doc?: boolean }
  [key: string]: unknown
}

export type RpcResponse<T> =
  | { ok: true; result: T }
  | { ok: false; error: { code: string; message: string } }
