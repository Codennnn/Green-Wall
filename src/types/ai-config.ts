export interface AiRuntimeConfig {
  /** OpenAI 兼容接口根地址 */
  baseUrl: string
  /** API 密钥 */
  apiKey: string
  /** 模型名称 */
  model: string
}

export type AiConfigSource = 'builtin' | 'custom'

export interface AiConfigState {
  /** 当前配置（null 表示使用内置） */
  config: AiRuntimeConfig | null
  /** 配置来源 */
  source: AiConfigSource
  /** 是否已加载完成 */
  isLoaded: boolean
}

export interface TestConnectionResponse {
  ok: boolean
  latencyMs?: number
  message?: string
  modelName?: string
}
