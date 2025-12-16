import type { YearlyReportRequest } from '~/types/ai-report'

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
    // 尝试解析错误信息
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`

    try {
      const errorData: unknown = await response.json()

      if (typeof errorData === 'object' && errorData !== null && 'message' in errorData && typeof (errorData as Record<string, unknown>).message === 'string') {
        errorMessage = (errorData as Record<string, unknown>).message as string
      }
    }
    catch {
      // 忽略解析错误
    }

    throw new Error(errorMessage)
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

  try {
    // 检查是否被中止
    if (signal?.aborted) {
      await reader.cancel()
      throw new DOMException('Aborted', 'AbortError')
    }

    let result = await reader.read()

    while (!result.done) {
      const chunk = decoder.decode(result.value, { stream: true })
      fullText += chunk
      onChunk(fullText)

      // 检查是否被中止
      if (signal?.aborted) {
        await reader.cancel()
        throw new DOMException('Aborted', 'AbortError')
      }

      result = await reader.read()
    }
  }
  finally {
    reader.releaseLock()
  }

  return fullText
}
