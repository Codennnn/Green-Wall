'use client'

import { useCallback, useRef, useState } from 'react'

import { fetchYearlyReportStream, readTextStream } from '~/services/ai-report'
import type {
  StreamStatus,
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

export interface UseYearlyAiReportStreamOptions {
  username: string
  year: number
  locale?: string
  tags: YearlyReportTags
  highlights?: YearlyReportHighlights
}

export interface UseYearlyAiReportStreamReturn {
  /** 当前生成的文本 */
  text: string
  /** 当前状态 */
  status: StreamStatus
  /** 错误信息 */
  error: string | null
  /** 开始生成 */
  start: () => Promise<void>
  /** 中止生成 */
  abort: () => void
  /** 重置状态 */
  reset: () => void
}

/**
 * 年度 AI 报告流式生成 Hook
 * 支持：流式显示、取消、重试、重新生成
 */
export function useYearlyAiReportStream(
  options: UseYearlyAiReportStreamOptions,
): UseYearlyAiReportStreamReturn {
  const { username, year, locale, tags, highlights } = options

  const [text, setText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  // 用于取消请求
  const abortControllerRef = useRef<AbortController | null>(null)

  /**
   * 开始生成
   */
  const start = useCallback(async () => {
    // 如果正在生成，先取消
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // 重置状态
    setText('')
    setError(null)
    setStatus('streaming')

    // 创建新的 AbortController
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    try {
      const response = await fetchYearlyReportStream(
        {
          username,
          year,
          locale,
          tags,
          highlights,
        },
        abortController.signal,
      )

      await readTextStream(
        response,
        (currentText) => {
          setText(currentText)
        },
        abortController.signal,
      )

      setStatus('success')
    }
    catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setStatus('aborted')

        return
      }

      setError(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
    finally {
      abortControllerRef.current = null
    }
  }, [username, year, locale, tags, highlights])

  /**
   * 中止生成
   */
  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    abort()
    setText('')
    setError(null)
    setStatus('idle')
  }, [abort])

  return {
    text,
    status,
    error,
    start,
    abort,
    reset,
  }
}
