'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

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

/** 空记录标识符，用于区分空状态 */
const EMPTY_RECORD_ID = '__empty__'

/** 空记录占位符，用于初始状态 */
const EMPTY_RECORD: AiReportHistoryRecord = {
  id: EMPTY_RECORD_ID,
  timestamp: 0,
  text: '',
  config: null,
}

export function useAiReportHistory(
  options: UseAiReportHistoryOptions,
): UseAiReportHistoryReturn {
  const { text, status, aiConfig } = options

  const [history, setHistory] = useState<AiReportHistoryRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  const historyRef = useRef(history)
  // 跟踪最后添加的文本，避免重复添加检测依赖 history
  const lastAddedTextRef = useRef<string | null>(null)

  useEffect(() => {
    historyRef.current = history
  }, [history])

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

  const addToHistory = useEvent((record: AiReportHistoryRecord) => {
    setHistory((prev) => [...prev, record])
    setCurrentIndex(historyRef.current.length)
    lastAddedTextRef.current = record.text
  })

  const goToPrevious = useEvent(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  })

  const goToNext = useEvent(() => {
    const maxIndex = historyRef.current.length - 1
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1))
  })

  useEffect(() => {
    const shouldAddToHistory = status === 'success' && text.length > 0 && lastAddedTextRef.current !== text

    if (shouldAddToHistory) {
      addToHistory({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        text,
        config: aiConfig,
      })
    }
  }, [status, text, aiConfig, addToHistory])

  return {
    history,
    currentIndex,
    ...derivedState,
    goToPrevious,
    goToNext,
  }
}
