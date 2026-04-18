'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { useEvent } from 'react-use-event-hook'

import { StorageKeys } from '~/constants'
import { extractDomain } from '~/lib/ai-config-url'
import type {
  AiConfigSource,
  AiConfigState,
  AiRuntimeConfig,
} from '~/types/ai-config'

export { extractDomain } from '~/lib/ai-config-url'

export interface AiConfigSourceInfo {
  source: AiConfigSource
  label: string
}

const SERVER_AI_CONFIG_STATE: AiConfigState = {
  config: null,
  source: 'builtin',
  isLoaded: false,
}

const BUILTIN_AI_CONFIG_STATE: AiConfigState = {
  config: null,
  source: 'builtin',
  isLoaded: true,
}

const BUILTIN_SOURCE_INFO: AiConfigSourceInfo = {
  source: 'builtin',
  label: 'builtin',
}

const aiConfigListeners = new Set<() => void>()

let cachedStorageValue: string | null | undefined
let cachedState: AiConfigState | undefined
let storageListenerAttached = false

function isAiRuntimeConfig(value: unknown): value is AiRuntimeConfig {
  return (
    typeof value === 'object'
    && value !== null
    && 'baseUrl' in value
    && 'apiKey' in value
    && 'model' in value
    && typeof (value as AiRuntimeConfig).baseUrl === 'string'
    && typeof (value as AiRuntimeConfig).apiKey === 'string'
    && typeof (value as AiRuntimeConfig).model === 'string'
  )
}

function parseConfigFromStorageValue(stored: string | null): AiRuntimeConfig | null {
  if (!stored) {
    return null
  }

  try {
    const parsed = JSON.parse(stored) as unknown

    return isAiRuntimeConfig(parsed)
      ? {
          baseUrl: parsed.baseUrl,
          apiKey: parsed.apiKey,
          model: parsed.model,
        }
      : null
  }
  catch {
    return null
  }
}

function serializeConfigForStorage(config: AiRuntimeConfig): string {
  return JSON.stringify({
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
  })
}

function setCachedAiConfigState(stored: string | null, config?: AiRuntimeConfig | null): void {
  const resolvedConfig = config === undefined
    ? parseConfigFromStorageValue(stored)
    : config

  cachedStorageValue = stored
  cachedState = resolvedConfig
    ? {
        config: resolvedConfig,
        source: 'custom',
        isLoaded: true,
      }
    : BUILTIN_AI_CONFIG_STATE
}

function readStoredConfigValue(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (cachedStorageValue !== undefined) {
    return cachedStorageValue
  }

  try {
    cachedStorageValue = localStorage.getItem(StorageKeys.AiConfig)
  }
  catch {
    cachedStorageValue = null
  }

  return cachedStorageValue
}

function getAiConfigSnapshot(): AiConfigState {
  const stored = readStoredConfigValue()

  if (cachedState === undefined || cachedStorageValue !== stored) {
    setCachedAiConfigState(stored)
  }

  return cachedState ?? BUILTIN_AI_CONFIG_STATE
}

function getServerAiConfigSnapshot(): AiConfigState {
  return SERVER_AI_CONFIG_STATE
}

function notifyAiConfigListeners(): void {
  aiConfigListeners.forEach((listener) => {
    listener()
  })
}

function handleStorageChange(event: StorageEvent): void {
  if (event.key !== StorageKeys.AiConfig && event.key !== null) {
    return
  }

  setCachedAiConfigState(event.newValue)
  notifyAiConfigListeners()
}

function subscribeAiConfig(listener: () => void): () => void {
  aiConfigListeners.add(listener)

  if (typeof window !== 'undefined' && !storageListenerAttached) {
    window.addEventListener('storage', handleStorageChange)
    storageListenerAttached = true
  }

  return () => {
    aiConfigListeners.delete(listener)

    if (typeof window !== 'undefined' && aiConfigListeners.size === 0 && storageListenerAttached) {
      window.removeEventListener('storage', handleStorageChange)
      storageListenerAttached = false
    }
  }
}

function saveConfigToStorage(config: AiRuntimeConfig): void {
  const stored = serializeConfigForStorage(config)

  if (typeof window === 'undefined') {
    setCachedAiConfigState(stored, config)
    notifyAiConfigListeners()

    return
  }

  try {
    localStorage.setItem(StorageKeys.AiConfig, stored)
  }
  catch {
    // 忽略存储错误（如配额超限）
  }

  setCachedAiConfigState(stored, config)
  notifyAiConfigListeners()
}

function removeConfigFromStorage(): void {
  if (typeof window === 'undefined') {
    setCachedAiConfigState(null, null)
    notifyAiConfigListeners()

    return
  }

  try {
    localStorage.removeItem(StorageKeys.AiConfig)
  }
  catch {
    // 忽略删除错误
  }

  setCachedAiConfigState(null, null)
  notifyAiConfigListeners()
}

export function getSourceDisplayInfo(config: AiRuntimeConfig | null): AiConfigSourceInfo {
  if (!config) {
    return BUILTIN_SOURCE_INFO
  }

  return { source: 'custom', label: extractDomain(config.baseUrl) ?? config.baseUrl }
}

export interface UseAiConfigReturn extends AiConfigState {
  /** 保存配置 */
  save: (config: AiRuntimeConfig) => void
  /** 重置为默认（删除自定义配置） */
  reset: () => void
  /** 获取来源显示信息 */
  sourceInfo: AiConfigSourceInfo
}

export function useAiConfig(): UseAiConfigReturn {
  const state = useSyncExternalStore(
    subscribeAiConfig,
    getAiConfigSnapshot,
    getServerAiConfigSnapshot,
  )

  const save = useEvent((config: AiRuntimeConfig) => {
    saveConfigToStorage(config)
  })

  const reset = useEvent(() => {
    removeConfigFromStorage()
  })

  const sourceInfo = useMemo(() => getSourceDisplayInfo(state.config), [state.config])

  return {
    ...state,
    save,
    reset,
    sourceInfo,
  }
}
