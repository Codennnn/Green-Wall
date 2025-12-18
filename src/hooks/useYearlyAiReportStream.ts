'use client'

import { useCallback, useRef, useState } from 'react'

import { fetchYearlyReportStream, readTextStream } from '~/services/ai-report'
import type { AiRuntimeConfig } from '~/types/ai-config'
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
  /** 可选的自定义 AI 配置 */
  aiConfig?: AiRuntimeConfig | null
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

export function useYearlyAiReportStream(
  options: UseYearlyAiReportStreamOptions,
): UseYearlyAiReportStreamReturn {
  const { username, year, locale, tags, highlights, aiConfig } = options

  const [text, setText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)

  const start = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setText('')
    setError(null)
    setStatus('streaming')

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
          // 仅当有自定义配置时才传递
          aiConfig: aiConfig ?? undefined,
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
  }, [username, year, locale, tags, highlights, aiConfig])

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  }, [])

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
