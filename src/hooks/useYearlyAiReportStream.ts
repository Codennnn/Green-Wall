'use client'

import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { eventTracker } from '~/lib/analytics'
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
  const startTimeRef = useRef<number>(0)

  const start = useEvent(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setText('')
    setError(null)
    setStatus('streaming')

    const configSource = aiConfig ? 'custom' : 'builtin'
    startTimeRef.current = performance.now()

    eventTracker.ai.report.generate.start(year, Boolean(highlights), configSource)

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

      const finalText = await readTextStream(
        response,
        (currentText) => {
          setText(currentText)
        },
        abortController.signal,
      )

      const durationMs = performance.now() - startTimeRef.current
      eventTracker.ai.report.generate.success(year, durationMs, finalText.length)

      setStatus('success')
    }
    catch (err) {
      const durationMs = performance.now() - startTimeRef.current

      if (err instanceof DOMException && err.name === 'AbortError') {
        // 使用最新的 text 状态值（因为流被中止，无法获取最终文本）
        const currentTextLength = text.length
        eventTracker.ai.report.generate.abort(year, durationMs, currentTextLength)
        setStatus('aborted')

        return
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      eventTracker.ai.report.generate.error(year, errorMessage, durationMs, configSource)
      setError(errorMessage)
      setStatus('error')
    }
    finally {
      abortControllerRef.current = null
    }
  })

  const abort = useEvent(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
  })

  const reset = useEvent(() => {
    abort()
    setText('')
    setError(null)
    setStatus('idle')
  })

  return {
    text,
    status,
    error,
    start,
    abort,
    reset,
  }
}
