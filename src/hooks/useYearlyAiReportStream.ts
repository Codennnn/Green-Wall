'use client'

import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { AiStreamError } from '~/lib/ai/stream-error'
import { eventTracker } from '~/lib/analytics'
import { fetchYearlyReportStream, readTextStream } from '~/services/ai-report'
import type { AiRuntimeConfig } from '~/types/ai-config'
import type {
  AiReportError,
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
  /** 结构化错误信息（包含错误码和消息） */
  error: AiReportError | null
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
  const [error, setError] = useState<AiReportError | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const startTimeRef = useRef<number>(0)
  const latestTextRef = useRef('')

  const start = useEvent(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    setText('')
    latestTextRef.current = ''
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
          latestTextRef.current = currentText
          setText(currentText)
        },
        abortController.signal,
      )

      latestTextRef.current = finalText
      const durationMs = performance.now() - startTimeRef.current
      eventTracker.ai.report.generate.success(year, durationMs, finalText.length)

      setStatus('success')
    }
    catch (err) {
      const durationMs = performance.now() - startTimeRef.current

      if (err instanceof DOMException && err.name === 'AbortError') {
        const currentTextLength = latestTextRef.current.length
        eventTracker.ai.report.generate.abort(year, durationMs, currentTextLength)
        setStatus('aborted')
      }
      else {
        // 区分 AI 流式错误（带错误码）和其他通用错误
        const reportError: AiReportError = err instanceof AiStreamError
          ? { code: err.code, message: err.message, retryable: err.retryable }
          : { code: 'unknown', message: err instanceof Error ? err.message : 'Unknown error', retryable: true }

        eventTracker.ai.report.generate.error(year, reportError.message, durationMs, configSource)
        setError(reportError)
        setStatus('error')
      }
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
    latestTextRef.current = ''
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
