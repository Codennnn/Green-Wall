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
      const errorData = await response.json()

      if (errorData.message) {
        errorMessage = errorData.message
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
    while (true) {
      // 检查是否被中止
      if (signal?.aborted) {
        reader.cancel()
        throw new DOMException('Aborted', 'AbortError')
      }

      const { done, value } = await reader.read()

      if (done) {
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      fullText += chunk
      onChunk(fullText)
    }
  }
  finally {
    reader.releaseLock()
  }

  return fullText
}
