import { ErrorType } from '~/enums'
import type { ResponseData } from '~/types'

export class ApiError extends Error {
  constructor(
    public status: number,
    public errorType: ErrorType,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | string[]>
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl = '') {
    this.baseUrl = baseUrl
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | string[]>,
  ): string {
    // 如果 endpoint 已经是完整的 URL，直接使用
    // 否则，如果有 baseUrl，则组合使用
    let url: URL

    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      url = new URL(endpoint)
    }
    else if (this.baseUrl) {
      url = new URL(endpoint, this.baseUrl)
    }
    else {
      // 如果没有 baseUrl，假设 endpoint 是相对路径
      // 在浏览器环境中使用当前域名，在服务器环境中使用 localhost
      const origin = typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000'
      url = new URL(endpoint, origin)
    }

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            url.searchParams.append(key, typeof v === 'string' ? v : String(v))
          })
        }
        else {
          url.searchParams.set(key, typeof value === 'string' ? value : String(value))
        }
      })
    }

    return url.toString()
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: ResponseData

      try {
        errorData = await response.json() as ResponseData
      }
      catch {
        throw new ApiError(
          response.status,
          ErrorType.BadRequest,
          `HTTP ${response.status}: ${response.statusText}`,
        )
      }

      throw new ApiError(
        response.status,
        errorData.errorType ?? ErrorType.BadRequest,
        errorData.message ?? `HTTP ${response.status}: ${response.statusText}`,
      )
    }

    try {
      return await response.json() as T
    }
    catch {
      throw new ApiError(500, ErrorType.BadRequest, 'Invalid JSON response')
    }
  }

  async get<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options

    const url = this.buildUrl(endpoint, params)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers)
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      ...fetchOptions,
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: FetchOptions = {},
  ): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(endpoint, params)

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers)
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...fetchOptions,
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()
