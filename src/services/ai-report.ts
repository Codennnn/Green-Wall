import {
  AiStreamError,
  STREAM_EVENT_DONE,
  STREAM_EVENT_ERROR,
  STREAM_EVENT_TEXT,
  toStreamErrorInfo,
} from '~/lib/ai/stream-error'
import type { StreamErrorInfo, YearlyReportRequest } from '~/types/ai-report'

interface SseFrame {
  event: string
  data: string
}

interface TextEventPayload {
  delta: string
}

interface SplitSseResult {
  frames: string[]
  remainder: string
}

function splitSseBuffer(buffer: string): SplitSseResult {
  const normalized = buffer.replaceAll('\r\n', '\n')
  const segments = normalized.split('\n\n')

  if (segments.length === 0) {
    return { frames: [], remainder: normalized }
  }

  const remainder = segments.pop() ?? ''

  return { frames: segments, remainder }
}

function parseSseFrame(rawFrame: string): SseFrame | null {
  if (rawFrame.trim().length === 0) {
    return null
  }

  const lines = rawFrame.split('\n')
  let event = 'message'
  const dataLines: string[] = []

  for (const line of lines) {
    if (line.startsWith(':')) {
      continue
    }

    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    }
    else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  }

  return {
    event,
    data: dataLines.join('\n'),
  }
}

function parseJsonPayload(payload: string): unknown {
  try {
    return JSON.parse(payload)
  }
  catch {
    return null
  }
}

function parseTextEventPayload(payload: unknown): TextEventPayload | null {
  if (typeof payload !== 'object' || payload === null) {
    return null
  }

  const value = payload as Record<string, unknown>

  if (typeof value.delta !== 'string') {
    return null
  }

  return { delta: value.delta }
}

function parseResponseError(errorData: unknown): StreamErrorInfo | null {
  return toStreamErrorInfo(errorData)
}

/**
 * 发起年度报告生成请求（流式）
 * 返回 Response 对象，调用方需要自行读取 body stream
 */
export async function fetchYearlyReportStream(
  request: YearlyReportRequest,
  signal?: AbortSignal,
): Promise<Response> {
  const response = await fetch('/api/ai/yearly-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
    signal,
  })

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`

    try {
      const errorData: unknown = await response.json()
      const parsedError = parseResponseError(errorData)

      if (parsedError) {
        throw new AiStreamError(parsedError.code, parsedError.message, parsedError.retryable)
      }

      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof (errorData as Record<string, unknown>).message === 'string') {
        errorMessage = (errorData as Record<string, unknown>).message as string
      }
    }
    catch (error) {
      if (error instanceof AiStreamError) {
        throw error
      }

      // 忽略解析错误
    }

    throw new AiStreamError('unknown', errorMessage, true)
  }

  return response
}

/**
 * 从 Response 中读取文本流
 * @param response - fetch 返回的 Response 对象
 * @param onChunk - 每次收到新文本时的回调
 * @param signal - 可选的 AbortSignal
 */
export async function readTextStream(
  response: Response,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const reader = response.body?.getReader()

  if (!reader) {
    throw new Error('Response body is not readable')
  }

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''
  let doneReceived = false

  try {
    // 检查是否被中止
    if (signal?.aborted) {
      await reader.cancel()
      throw new DOMException('Aborted', 'AbortError')
    }

    let result = await reader.read()

    while (!result.done) {
      const chunk = decoder.decode(result.value, { stream: true })
      buffer += chunk

      const { frames, remainder } = splitSseBuffer(buffer)
      buffer = remainder

      for (const rawFrame of frames) {
        const frame = parseSseFrame(rawFrame)

        if (!frame) {
          continue
        }

        if (frame.event === STREAM_EVENT_TEXT) {
          const payload = parseTextEventPayload(parseJsonPayload(frame.data))

          if (!payload) {
            throw new AiStreamError('unknown', 'Invalid stream text payload', false)
          }

          fullText += payload.delta
          onChunk(fullText)
        }
        else if (frame.event === STREAM_EVENT_ERROR) {
          const parsedError = toStreamErrorInfo(parseJsonPayload(frame.data))

          if (!parsedError) {
            throw new AiStreamError('unknown', 'Invalid stream error payload', false)
          }

          throw new AiStreamError(parsedError.code, parsedError.message, parsedError.retryable)
        }
        else if (frame.event === STREAM_EVENT_DONE) {
          doneReceived = true
        }
      }

      // 检查是否被中止
      if (signal?.aborted) {
        await reader.cancel()
        throw new DOMException('Aborted', 'AbortError')
      }

      result = await reader.read()
    }

    buffer += decoder.decode()

    if (buffer.trim()) {
      const finalFrame = parseSseFrame(buffer.trim())

      if (finalFrame?.event === STREAM_EVENT_ERROR) {
        const parsedError = toStreamErrorInfo(parseJsonPayload(finalFrame.data))

        if (parsedError) {
          throw new AiStreamError(parsedError.code, parsedError.message, parsedError.retryable)
        }
      }
    }

    if (!doneReceived && fullText.length === 0) {
      throw new AiStreamError('unknown', 'Stream ended unexpectedly', true)
    }
  }
  finally {
    reader.releaseLock()
  }

  return fullText
}
