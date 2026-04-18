'use client'

import { startTransition, useEffect, useRef, useState } from 'react'
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

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError'
}

function toAiReportError(error: unknown): AiReportError {
  if (error instanceof AiStreamError) {
    return {
      code: error.code,
      message: error.message,
      retryable: error.retryable,
    }
  }

  return {
    code: 'unknown',
    message: error instanceof Error ? error.message : 'Unknown error',
    retryable: true,
  }
}

export function useYearlyAiReportStream(
  options: UseYearlyAiReportStreamOptions,
): UseYearlyAiReportStreamReturn {
  const { username, year, locale, tags, highlights, aiConfig } = options

  const [text, setText] = useState('')
  const [status, setStatus] = useState<StreamStatus>('idle')
  const [error, setError] = useState<AiReportError | null>(null)

  const abortControllerRef = useRef<AbortController | null>(null)
  const activeRequestIdRef = useRef(0)
  const textFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const latestTextRef = useRef('')

  const cancelScheduledTextUpdate = useEvent(() => {
    if (textFrameRef.current === null) {
      return
    }

    window.cancelAnimationFrame(textFrameRef.current)
    textFrameRef.current = null
  })

  const isActiveRequest = useEvent((requestId: number, abortController: AbortController) => (
    activeRequestIdRef.current === requestId && abortControllerRef.current === abortController
  ))

  const scheduleTextUpdate = useEvent((requestId: number, currentText: string) => {
    latestTextRef.current = currentText

    if (textFrameRef.current !== null) {
      return
    }

    textFrameRef.current = window.requestAnimationFrame(() => {
      textFrameRef.current = null

      if (activeRequestIdRef.current !== requestId) {
        return
      }

      const nextText = latestTextRef.current
      startTransition(() => {
        setText(nextText)
      })
    })
  })

  const flushTextUpdate = useEvent((requestId: number, currentText: string) => {
    latestTextRef.current = currentText
    cancelScheduledTextUpdate()

    if (activeRequestIdRef.current !== requestId) {
      return
    }

    setText(currentText)
  })

  const start = useEvent(async () => {
    const requestId = activeRequestIdRef.current + 1
    activeRequestIdRef.current = requestId

    abortControllerRef.current?.abort()
    cancelScheduledTextUpdate()

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

      if (!isActiveRequest(requestId, abortController)) {
        return
      }

      const finalText = await readTextStream(
        response,
        (currentText) => {
          scheduleTextUpdate(requestId, currentText)
        },
        abortController.signal,
      )

      if (!isActiveRequest(requestId, abortController)) {
        return
      }

      flushTextUpdate(requestId, finalText)
      const durationMs = performance.now() - startTimeRef.current
      eventTracker.ai.report.generate.success(year, durationMs, finalText.length)

      setStatus('success')
    }
    catch (err) {
      if (!isActiveRequest(requestId, abortController)) {
        return
      }

      const durationMs = performance.now() - startTimeRef.current

      if (isAbortError(err)) {
        const currentTextLength = latestTextRef.current.length
        eventTracker.ai.report.generate.abort(year, durationMs, currentTextLength)
        setStatus('aborted')
      }
      else {
        const reportError = toAiReportError(err)

        eventTracker.ai.report.generate.error(year, reportError.message, durationMs, configSource)
        setError(reportError)
        setStatus('error')
      }
    }
    finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  })

  const abort = useEvent(() => {
    abortControllerRef.current?.abort()
  })

  const reset = useEvent(() => {
    activeRequestIdRef.current += 1
    abortControllerRef.current?.abort()
    abortControllerRef.current = null
    cancelScheduledTextUpdate()
    setText('')
    latestTextRef.current = ''
    setError(null)
    setStatus('idle')
  })

  useEffect(() => cancelScheduledTextUpdate, [cancelScheduledTextUpdate])

  return {
    text,
    status,
    error,
    start,
    abort,
    reset,
  }
}
