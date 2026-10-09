'use client'

import { useEffect, useMemo, useReducer, useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { StorageKeys } from '~/constants'
import type { AiRuntimeConfig } from '~/types/ai-config'

export interface AiReportHistoryRecord {
  /** 唯一标识符 */
  id: string
  /** 创建时间戳 */
  timestamp: number
  /** 报告文本内容 */
  text: string
  /** 生成时使用的 AI 配置 */
  config: AiRuntimeConfig | null
}

interface UseAiReportHistoryOptions {
  /** 当前生成的文本 */
  text: string
  /** 当前生成状态 */
  status: 'idle' | 'streaming' | 'success' | 'error' | 'aborted'
  /** 当前 AI 配置 */
  aiConfig: AiRuntimeConfig | null
  /** 本地缓存作用域（例如 `username-year`），传入后历史版本会落盘，刷新不丢 */
  storageScope?: string
}

interface UseAiReportHistoryReturn {
  history: AiReportHistoryRecord[]
  currentIndex: number
  currentVersion: AiReportHistoryRecord
  hasHistory: boolean
  isFirstVersion: boolean
  isLastVersion: boolean
  isGeneratingNew: boolean
  goToPrevious: () => void
  goToNext: () => void
}

interface HistoryState {
  history: AiReportHistoryRecord[]
  currentIndex: number
}

type HistoryAction
  = { type: 'add', record: AiReportHistoryRecord }
    | { type: 'hydrate', history: AiReportHistoryRecord[] }
    | { type: 'previous' }
    | { type: 'next' }

/** 空记录标识符，用于区分空状态 */
const EMPTY_RECORD_ID = '__empty__'

/** 空记录占位符，用于初始状态 */
const EMPTY_RECORD: AiReportHistoryRecord = {
  id: EMPTY_RECORD_ID,
  timestamp: 0,
  text: '',
  config: null,
}

const INITIAL_HISTORY_STATE: HistoryState = {
  history: [],
  currentIndex: 0,
}

/** 本地缓存保留的最大版本数，避免历史无限增长 */
const MAX_PERSISTED_VERSIONS = 5

/** 落盘的版本记录：不含 AI 配置，避免把 API Key 复制到别处 */
interface PersistedRecord {
  id: string
  timestamp: number
  text: string
}

function getStorageKey(scope: string): string {
  return `${StorageKeys.AiReport}:${scope}`
}

function readPersistedHistory(scope: string): AiReportHistoryRecord[] {
  try {
    const raw = localStorage.getItem(getStorageKey(scope))

    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .filter((item): item is PersistedRecord => {
        if (typeof item !== 'object' || item === null) {
          return false
        }

        const record = item as Record<string, unknown>

        return typeof record.id === 'string'
          && typeof record.timestamp === 'number'
          && typeof record.text === 'string'
          && record.text.length > 0
      })
      .slice(-MAX_PERSISTED_VERSIONS)
      .map((record) => ({
        id: record.id,
        timestamp: record.timestamp,
        text: record.text,
        // 缓存不保存配置来源，恢复后的版本不标注生成时使用的配置
        config: null,
      }))
  }
  catch {
    // 缓存不可用（隐私模式、配额满等）时按无历史处理
    return []
  }
}

function writePersistedHistory(scope: string, history: AiReportHistoryRecord[]): void {
  const records: PersistedRecord[] = history
    .slice(-MAX_PERSISTED_VERSIONS)
    .map(({ id, timestamp, text }) => ({ id, timestamp, text }))

  try {
    localStorage.setItem(getStorageKey(scope), JSON.stringify(records))
  }
  catch {
    // 忽略存储错误，缓存失败不影响当前会话
  }
}

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'add': {
      const history = [...state.history, action.record]

      return {
        history,
        currentIndex: history.length - 1,
      }
    }

    case 'hydrate': {
      return {
        history: action.history,
        currentIndex: Math.max(0, action.history.length - 1),
      }
    }

    case 'previous': {
      if (state.currentIndex === 0) {
        return state
      }

      return {
        ...state,
        currentIndex: state.currentIndex - 1,
      }
    }

    case 'next': {
      if (state.history.length === 0) {
        return state
      }

      const nextIndex = Math.min(state.history.length - 1, state.currentIndex + 1)

      if (nextIndex === state.currentIndex) {
        return state
      }

      return {
        ...state,
        currentIndex: nextIndex,
      }
    }

    default:
      return state
  }
}

export function useAiReportHistory(
  options: UseAiReportHistoryOptions,
): UseAiReportHistoryReturn {
  const { text, status, aiConfig, storageScope } = options

  const [{ history, currentIndex }, dispatch] = useReducer(
    historyReducer,
    INITIAL_HISTORY_STATE,
  )

  const previousStatusRef = useRef<UseAiReportHistoryOptions['status'] | null>(null)
  const addedForSuccessRef = useRef(false)
  const hydratedScopeRef = useRef<string | null>(null)

  // 换用户或换年份时用缓存里的历史替换内存状态（同一作用域内不重复恢复）
  useEffect(() => {
    if (!storageScope || hydratedScopeRef.current === storageScope) {
      return
    }

    hydratedScopeRef.current = storageScope
    dispatch({ type: 'hydrate', history: readPersistedHistory(storageScope) })
  }, [storageScope])

  // 历史变化后写回缓存；空历史不写，避免覆盖已缓存的内容
  useEffect(() => {
    if (!storageScope || hydratedScopeRef.current !== storageScope || history.length === 0) {
      return
    }

    writePersistedHistory(storageScope, history)
  }, [storageScope, history])

  const aiConfigBaseUrl = aiConfig?.baseUrl
  const aiConfigApiKey = aiConfig?.apiKey
  const aiConfigModel = aiConfig?.model

  const derivedState = useMemo(() => {
    // 确保索引在有效范围内
    const safeIndex = history.length === 0
      ? 0
      : Math.min(currentIndex, history.length - 1)

    return {
      currentVersion: history[safeIndex] ?? EMPTY_RECORD,
      hasHistory: history.length >= 2,
      isFirstVersion: safeIndex === 0,
      isLastVersion: safeIndex >= history.length - 1 || history.length === 0,
      isGeneratingNew: status === 'streaming' && history.length > 0,
    }
  }, [history, currentIndex, status])

  const goToPrevious = useEvent(() => {
    dispatch({ type: 'previous' })
  })

  const goToNext = useEvent(() => {
    dispatch({ type: 'next' })
  })

  useEffect(() => {
    const wasSuccess = previousStatusRef.current === 'success'
    const isSuccess = status === 'success'

    if (!isSuccess) {
      previousStatusRef.current = status
      addedForSuccessRef.current = false

      return
    }

    if (!wasSuccess) {
      addedForSuccessRef.current = false
    }

    previousStatusRef.current = status

    if (!addedForSuccessRef.current && text.length > 0) {
      const hasCustomConfig = aiConfigBaseUrl !== undefined
        && aiConfigApiKey !== undefined
        && aiConfigModel !== undefined
      const config = hasCustomConfig
        ? {
            baseUrl: aiConfigBaseUrl,
            apiKey: aiConfigApiKey,
            model: aiConfigModel,
          }
        : null

      dispatch({
        type: 'add',
        record: {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          text,
          config,
        },
      })
      addedForSuccessRef.current = true
    }
  }, [status, text, aiConfigBaseUrl, aiConfigApiKey, aiConfigModel])

  return {
    history,
    currentIndex,
    ...derivedState,
    goToPrevious,
    goToNext,
  }
}
