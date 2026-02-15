import type { AiStreamErrorCode, StreamErrorInfo } from '~/types/ai-report'

/**
 * SSE 事件名常量，避免魔法字符串
 */
export const STREAM_EVENT_TEXT = 'text'
export const STREAM_EVENT_ERROR = 'error'
export const STREAM_EVENT_DONE = 'done'

const AI_STREAM_ERROR_CODES: ReadonlySet<AiStreamErrorCode> = new Set([
  'authError',
  'badRequest',
  'forbidden',
  'modelNotFound',
  'contextLengthExceeded',
  'rateLimit',
  'quotaExceeded',
  'timeout',
  'gatewayTimeout',
  'serviceOverloaded',
  'networkError',
  'contentFilter',
  'serverError',
  'unknown',
])

function getDefaultRetryable(code: AiStreamErrorCode): boolean {
  if (code === 'rateLimit'
    || code === 'timeout'
    || code === 'gatewayTimeout'
    || code === 'serviceOverloaded'
    || code === 'networkError'
    || code === 'serverError'
    || code === 'unknown') {
    return true
  }

  return false
}

function createStreamErrorInfo(code: AiStreamErrorCode, message: string): StreamErrorInfo {
  return {
    code,
    message,
    retryable: getDefaultRetryable(code),
  }
}

function getStatusFromRecord(record: Record<string, unknown>): number | null {
  if (typeof record.status === 'number') {
    return record.status
  }

  if (typeof record.statusCode === 'number') {
    return record.statusCode
  }

  if (typeof record.code === 'number') {
    return record.code
  }

  if (typeof record.response === 'object' && record.response !== null) {
    const response = record.response as Record<string, unknown>

    if (typeof response.status === 'number') {
      return response.status
    }

    if (typeof response.statusCode === 'number') {
      return response.statusCode
    }
  }

  if (typeof record.cause === 'object' && record.cause !== null) {
    return getStatusFromRecord(record.cause as Record<string, unknown>)
  }

  return null
}

function getStatusFromError(error: Error): number | null {
  const errorRecord = error as unknown as Record<string, unknown>
  const structuredStatus = getStatusFromRecord(errorRecord)

  if (structuredStatus !== null) {
    return structuredStatus
  }

  const statusMatch = /\b([1-5]\d{2})\b/.exec(error.message)

  if (statusMatch?.[1]) {
    return Number(statusMatch[1])
  }

  return null
}

function classifyByStatus(status: number): StreamErrorInfo | null {
  if (status === 400 || status === 422) {
    return createStreamErrorInfo('badRequest', 'Invalid request parameters')
  }

  if (status === 401) {
    return createStreamErrorInfo('authError', 'Invalid or expired API key')
  }

  if (status === 403) {
    return createStreamErrorInfo('forbidden', 'Access denied by AI service')
  }

  if (status === 404) {
    return createStreamErrorInfo('modelNotFound', 'Model not found or endpoint invalid')
  }

  if (status === 408) {
    return createStreamErrorInfo('timeout', 'Connection timeout')
  }

  if (status === 413) {
    return createStreamErrorInfo('contextLengthExceeded', 'Input too long for model context window')
  }

  if (status === 429) {
    return createStreamErrorInfo('rateLimit', 'Rate limited, please try again later')
  }

  if (status === 500 || status === 502 || status === 503) {
    return createStreamErrorInfo('serverError', 'AI service temporarily unavailable')
  }

  if (status === 504) {
    return createStreamErrorInfo('gatewayTimeout', 'AI service gateway timeout')
  }

  return null
}

/**
 * AI 流式传输错误
 * 当 AI API 调用在流式传输过程中失败时抛出此错误
 */
export class AiStreamError extends Error {
  readonly code: AiStreamErrorCode
  readonly retryable: boolean

  constructor(code: AiStreamErrorCode, message: string, retryable = getDefaultRetryable(code)) {
    super(message)
    this.name = 'AiStreamError'
    this.code = code
    this.retryable = retryable
  }
}

/**
 * 分类 AI API 错误
 * 将底层 AI SDK 抛出的错误映射为用户可理解的错误码和英文兜底消息
 * 参考 test-connection/route.ts 的分类方式
 */
export function classifyAiError(error: unknown): StreamErrorInfo {
  if (!(error instanceof Error)) {
    return createStreamErrorInfo('unknown', 'An unexpected error occurred')
  }

  const msg = error.message.toLowerCase()
  const status = getStatusFromError(error)

  if (status !== null) {
    const statusMatchedError = classifyByStatus(status)

    if (statusMatchedError) {
      return statusMatchedError
    }
  }

  if (msg.includes('maximum context length')
    || msg.includes('context length')
    || msg.includes('prompt is too long')
    || msg.includes('input is too long')
    || msg.includes('too many tokens')
    || msg.includes('token limit')
    || msg.includes('context window')) {
    return createStreamErrorInfo('contextLengthExceeded', 'Input too long for model context window')
  }

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return createStreamErrorInfo('rateLimit', 'Rate limited, please try again later')
  }

  if (msg.includes('insufficient_quota')
    || msg.includes('quota')
    || msg.includes('billing')
    || msg.includes('credit balance')) {
    return createStreamErrorInfo('quotaExceeded', 'API quota exceeded')
  }

  // 认证错误：API Key 无效、过期或未激活
  if (msg.includes('unauthorized')
    || msg.includes('authentication')
    || msg.includes('invalid api key')
    || msg.includes('api key')) {
    return createStreamErrorInfo('authError', 'Invalid or expired API key')
  }

  if (msg.includes('forbidden')
    || msg.includes('access denied')
    || msg.includes('permission denied')
    || msg.includes('permission')) {
    return createStreamErrorInfo('forbidden', 'Access denied by AI service')
  }

  // 模型或端点不存在
  if (msg.includes('model not found')
    || msg.includes('no such model')
    || msg.includes('deployment not found')
    || msg.includes('not found')) {
    return createStreamErrorInfo('modelNotFound', 'Model not found or endpoint invalid')
  }

  if (msg.includes('bad request')
    || msg.includes('invalid request')
    || msg.includes('validation')
    || msg.includes('unprocessable')
    || msg.includes('malformed')) {
    return createStreamErrorInfo('badRequest', 'Invalid request parameters')
  }

  // 连接超时
  if (msg.includes('gateway timeout')) {
    return createStreamErrorInfo('gatewayTimeout', 'AI service gateway timeout')
  }

  if (msg.includes('overloaded')
    || msg.includes('over capacity')
    || msg.includes('server is busy')
    || msg.includes('529')) {
    return createStreamErrorInfo('serviceOverloaded', 'AI service is overloaded, please retry later')
  }

  if (msg.includes('timeout') || msg.includes('timed out') || msg.includes('deadline exceeded') || msg.includes('deadline')) {
    return createStreamErrorInfo('timeout', 'Connection timeout')
  }

  // 网络错误
  if (msg.includes('network')
    || msg.includes('fetch failed')
    || msg.includes('failed to fetch')
    || msg.includes('econnrefused')
    || msg.includes('enotfound')
    || msg.includes('socket')
    || msg.includes('dns')) {
    return createStreamErrorInfo('networkError', 'Network error, please check the URL')
  }

  // 内容安全过滤
  if (msg.includes('content filter')
    || msg.includes('content_filter')
    || msg.includes('safety')
    || msg.includes('sensitive content')
    || msg.includes('blocked')) {
    return createStreamErrorInfo('contentFilter', 'Content blocked by safety filter')
  }

  // 服务端错误
  if (msg.includes('internal server error') || msg.includes('service unavailable') || msg.includes('server error')) {
    return createStreamErrorInfo('serverError', 'AI service temporarily unavailable')
  }

  return createStreamErrorInfo('unknown', 'An unexpected error occurred during generation')
}

/**
 * 运行时校验结构化错误信息，避免解析污染导致 UI 崩溃
 */
export function toStreamErrorInfo(value: unknown): StreamErrorInfo | null {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const payload = value as Record<string, unknown>

  if (typeof payload.code !== 'string' || !AI_STREAM_ERROR_CODES.has(payload.code as AiStreamErrorCode)) {
    return null
  }

  if (typeof payload.message !== 'string') {
    return null
  }

  const code = payload.code as AiStreamErrorCode

  return {
    code,
    message: payload.message,
    retryable: typeof payload.retryable === 'boolean'
      ? payload.retryable
      : getDefaultRetryable(code),
  }
}
