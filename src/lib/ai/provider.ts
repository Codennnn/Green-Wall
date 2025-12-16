import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

/**
 * AI Provider 配置
 * 使用 OpenAI 兼容接口，可接入 OpenAI / DeepSeek / 通义千问等服务
 */

const AI_BASE_URL = process.env.AI_BASE_URL ?? 'https://api.openai.com/v1'
const AI_API_KEY = process.env.AI_API_KEY ?? ''
const AI_MODEL = process.env.AI_MODEL ?? 'gpt-4o-mini'

/**
 * 检查 AI 配置是否完整
 */
export function checkAiConfig(): { valid: boolean, message?: string } {
  if (!AI_API_KEY) {
    return {
      valid: false,
      message: 'AI_API_KEY environment variable is not set',
    }
  }

  return { valid: true }
}

/**
 * 创建 OpenAI 兼容的 provider 实例
 */
export const aiProvider = createOpenAICompatible({
  name: 'ai-provider',
  apiKey: AI_API_KEY,
  baseURL: AI_BASE_URL,
})

/**
 * 获取配置的模型实例
 */
export function getAiModel() {
  return aiProvider.chatModel(AI_MODEL)
}

/**
 * 获取当前配置的模型名称
 */
export function getAiModelName() {
  return AI_MODEL
}
