'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type {
  AiConfigSource,
  AiConfigState,
  AiRuntimeConfig,
} from '~/types/ai-config'

const STORAGE_KEY = 'greenwall.aiConfig.v1'

function loadConfigFromStorage(): AiRuntimeConfig | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) {
      return null
    }

    const parsed = JSON.parse(stored) as unknown

    if (
      typeof parsed === 'object'
      && parsed !== null
      && 'baseUrl' in parsed
      && 'apiKey' in parsed
      && 'model' in parsed
      && typeof (parsed as AiRuntimeConfig).baseUrl === 'string'
      && typeof (parsed as AiRuntimeConfig).apiKey === 'string'
      && typeof (parsed as AiRuntimeConfig).model === 'string'
    ) {
      return parsed as AiRuntimeConfig
    }

    return null
  }
  catch {
    return null
  }
}

function saveConfigToStorage(config: AiRuntimeConfig): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }
  catch {
    // 忽略存储错误（如配额超限）
  }
}

function removeConfigFromStorage(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
  }
  catch {
    // 忽略删除错误
  }
}

export function extractDomain(baseUrl: string): string {
  try {
    const url = new URL(baseUrl)

    return url.hostname
  }
  catch {
    return baseUrl
  }
}

export function getSourceDisplayInfo(config: AiRuntimeConfig | null): {
  source: AiConfigSource
  label: string
} {
  if (!config) {
    return { source: 'builtin', label: 'builtin' }
  }

  return { source: 'custom', label: extractDomain(config.baseUrl) }
}

export interface UseAiConfigReturn extends AiConfigState {
  /** 保存配置 */
  save: (config: AiRuntimeConfig) => void
  /** 重置为默认（删除自定义配置） */
  reset: () => void
  /** 获取来源显示信息 */
  sourceInfo: { source: AiConfigSource, label: string }
}

export function useAiConfig(): UseAiConfigReturn {
  const [state, setState] = useState<AiConfigState>({
    config: null,
    source: 'builtin',
    isLoaded: false,
  })

  useEffect(() => {
    const storedConfig = loadConfigFromStorage()
    setState({
      config: storedConfig,
      source: storedConfig ? 'custom' : 'builtin',
      isLoaded: true,
    })
  }, [])

  const save = useEvent((config: AiRuntimeConfig) => {
    saveConfigToStorage(config)
    setState({
      config,
      source: 'custom',
      isLoaded: true,
    })
  })

  const reset = useEvent(() => {
    removeConfigFromStorage()
    setState({
      config: null,
      source: 'builtin',
      isLoaded: true,
    })
  })

  const sourceInfo = getSourceDisplayInfo(state.config)

  return {
    ...state,
    save,
    reset,
    sourceInfo,
  }
}
