import type { NextRequest } from 'next/server'

import { auth } from '~/auth/index'
import type {
  DataAccessOptions,
  DataMode,
  FallbackReason,
  ResponseMeta,
} from '~/types'

export interface TokenResult {
  /** 数据获取模式 */
  mode: DataMode
  /** 用于 GitHub API 调用的 token（可能是用户 token 或服务端 token） */
  token: string
  /** 登录用户的 GitHub login（如果已登录） */
  viewerLogin?: string
  /** 回退到公开模式的原因（仅当 mode 为 public 时存在） */
  fallbackReason?: FallbackReason
  /** 请求是否尝试包含私有贡献 */
  includePrivate: boolean
}

export interface TokenRequestOptions extends DataAccessOptions {
  /**
   * 需要的 OAuth scopes。当前私有贡献依赖 GitHub OAuth App 的 repo scope。
   */
  requiredScopes?: string[]
}

export interface TokenExecutionResult<T> {
  data: T
  tokenResult: TokenResult
}

const SERVER_TOKEN = process.env.GITHUB_ACCESS_TOKEN

function getServerToken(): string {
  if (!SERVER_TOKEN) {
    throw new Error('GITHUB_ACCESS_TOKEN is not configured')
  }

  return SERVER_TOKEN
}

function toPublicTokenResult(
  fallbackReason: FallbackReason,
  options: { viewerLogin?: string, includePrivate?: boolean } = {},
): TokenResult {
  const { viewerLogin, includePrivate = false } = options

  return {
    mode: 'public',
    token: getServerToken(),
    ...(viewerLogin && { viewerLogin }),
    fallbackReason,
    includePrivate,
  }
}

function hasRequiredScopes(
  grantedScopes: string[] | undefined,
  requiredScopes: string[],
): boolean {
  if (requiredScopes.length === 0) {
    return true
  }

  const grantedScopeSet = new Set(
    (grantedScopes ?? []).map((scope) => scope.toLowerCase()),
  )

  return requiredScopes.every((scope) =>
    grantedScopeSet.has(scope.toLowerCase()),
  )
}

export function tokenResultToMeta(tokenResult: TokenResult): ResponseMeta {
  const { mode, viewerLogin, fallbackReason, includePrivate } = tokenResult

  return {
    mode,
    includePrivate,
    ...(viewerLogin && { viewer: { login: viewerLogin } }),
    ...(fallbackReason && { reason: fallbackReason }),
  }
}

export function isGitHubTokenError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  const message = error.message.toLowerCase()

  return (
    message.includes('bad credentials')
    || message.includes('unauthorized')
    || message.includes('requires authentication')
    || message.includes('http 401')
    || message.includes('fetch error: unauthorized')
  )
}

/**
 * 从请求中解析 GitHub access token。
 *
 * 规则：
 * 1. 未登录、未开启私有贡献、查看其他用户，都使用服务端 token（公开模式）
 * 2. 只有已登录、查看本人、显式开启私有贡献、且 OAuth token 具备所需 scope，才使用用户 token
 */
export async function getGitHubAccessToken(
  request: NextRequest,
  targetUsername: string,
  options: TokenRequestOptions = {},
): Promise<TokenResult> {
  const includePrivate = options.includePrivate === true
  const requiredScopes = options.requiredScopes ?? []

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return toPublicTokenResult('not_logged_in', { includePrivate })
    }

    const user = session.user as {
      login?: string
      id?: string
      name?: string | null
    }
    const viewerLogin = user.login

    if (!viewerLogin) {
      return toPublicTokenResult('token_invalid', { includePrivate })
    }

    const isMatchingUser
      = targetUsername.toLowerCase() === viewerLogin.toLowerCase()

    if (!isMatchingUser) {
      return toPublicTokenResult('username_mismatch', {
        viewerLogin,
        includePrivate,
      })
    }

    if (!includePrivate) {
      return toPublicTokenResult('private_disabled', {
        viewerLogin,
        includePrivate,
      })
    }

    let userAccessToken: string | undefined
    let grantedScopes: string[] | undefined

    try {
      const tokenResult = await auth.api.getAccessToken({
        headers: request.headers,
        body: {
          providerId: 'github',
        },
      })

      userAccessToken = tokenResult.accessToken
      grantedScopes = tokenResult.scopes
    }
    catch {
      userAccessToken = undefined
    }

    if (!userAccessToken) {
      return toPublicTokenResult('token_missing', {
        viewerLogin,
        includePrivate,
      })
    }

    if (!hasRequiredScopes(grantedScopes, requiredScopes)) {
      return toPublicTokenResult('scope_missing', {
        viewerLogin,
        includePrivate,
      })
    }

    return {
      mode: 'authorized',
      token: userAccessToken,
      viewerLogin,
      includePrivate,
    }
  }
  catch {
    return toPublicTokenResult('token_invalid', { includePrivate })
  }
}

export async function runWithGitHubAccessToken<T>(
  request: NextRequest,
  targetUsername: string,
  options: TokenRequestOptions,
  run: (tokenResult: TokenResult) => Promise<T>,
): Promise<TokenExecutionResult<T>> {
  const tokenResult = await getGitHubAccessToken(
    request,
    targetUsername,
    options,
  )

  try {
    const data = await run(tokenResult)

    return { data, tokenResult }
  }
  catch (error) {
    if (tokenResult.mode === 'authorized' && isGitHubTokenError(error)) {
      const fallbackTokenResult = toPublicTokenResult('token_invalid', {
        viewerLogin: tokenResult.viewerLogin,
        includePrivate: tokenResult.includePrivate,
      })
      const data = await run(fallbackTokenResult)

      return { data, tokenResult: fallbackTokenResult }
    }

    throw error
  }
}
