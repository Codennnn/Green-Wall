import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

import type { AiConfigSource, AiRuntimeConfig } from '~/types/ai-config'

import { validateSafeUrl } from '../security/safe-url'

import { type aiProvider, checkAiConfig, getAiModel, getAiModelName } from './provider'

export interface ModelFactoryResult {
  /** AI 模型实例 */
  model: ReturnType<typeof aiProvider.chatModel>
  /** 配置来源 */
  source: AiConfigSource
  /** 模型名称 */
  modelName: string
}

export interface ModelFactoryError {
  valid: false
  message: string
}

/**
 * 从自定义配置创建临时 provider 和 model
 */
function createCustomModel(config: AiRuntimeConfig) {
  const customProvider = createOpenAICompatible({
    name: 'custom-ai-provider',
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  })

  return customProvider.chatModel(config.model)
}

/**
 * 根据请求获取模型实例
 * - 有自定义配置：使用自定义配置创建临时 provider
 * - 无自定义配置：使用环境变量配置的内置 provider
 *
 * @param aiConfig - 可选的自定义 AI 配置
 * @returns 模型实例和元信息，或错误对象
 */
export function getModelFromRequest(
  aiConfig?: AiRuntimeConfig,
): ModelFactoryResult | ModelFactoryError {
  // 使用自定义配置
  if (aiConfig) {
    // 验证必填字段
    if (!aiConfig.baseUrl || !aiConfig.apiKey || !aiConfig.model) {
      return {
        valid: false,
        message: 'Custom AI config requires baseUrl, apiKey, and model',
      }
    }

    // 验证 URL 安全性（SSRF 防护）
    const urlValidation = validateSafeUrl(aiConfig.baseUrl)

    if (!urlValidation.valid) {
      return {
        valid: false,
        message: urlValidation.message ?? 'Invalid base URL',
      }
    }

    // 创建自定义模型
    const model = createCustomModel(aiConfig)

    return {
      model,
      source: 'custom',
      modelName: aiConfig.model,
    }
  }

  // 使用内置配置（环境变量）
  const envCheck = checkAiConfig()

  if (!envCheck.valid) {
    return {
      valid: false,
      message: envCheck.message ?? 'AI configuration error',
    }
  }

  return {
    model: getAiModel(),
    source: 'builtin',
    modelName: getAiModelName(),
  }
}

/**
 * 类型守卫：检查是否为错误结果
 */
export function isModelFactoryError(
  result: ModelFactoryResult | ModelFactoryError,
): result is ModelFactoryError {
  return 'valid' in result && !result.valid
}
