import type { NextRequest } from 'next/server'

import { auth } from '~/auth/index'

export type DataMode = 'public' | 'authorized'

export type FallbackReason
  = | 'not_logged_in'
    | 'username_mismatch'
    | 'token_missing'
    | 'token_invalid'

export interface TokenResult {
  /** 数据获取模式 */
  mode: DataMode
  /** 用于 GitHub API 调用的 token（可能是用户 token 或服务端 token） */
  token: string
  /** 登录用户的 GitHub login（如果已登录） */
  viewerLogin?: string
  /** 回退到公开模式的原因（仅当 mode 为 public 时存在） */
  fallbackReason?: FallbackReason
}

const SERVER_TOKEN = process.env.GITHUB_ACCESS_TOKEN

/**
 * 从请求中解析 GitHub access token
 *
 * 规则：
 * 1. 如果用户已登录且请求的 username 匹配用户的 GitHub login，使用用户 token（授权模式）
 * 2. 否则使用服务端 token（公开模式）
 *
 * @param request - Next.js 请求对象
 * @param targetUsername - 请求的目标用户名
 * @returns Token 解析结果
 */
export async function getGitHubAccessToken(
  request: NextRequest,
  targetUsername: string,
): Promise<TokenResult> {
  if (!SERVER_TOKEN) {
    throw new Error('GITHUB_ACCESS_TOKEN is not configured')
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    // 用户未登录
    if (!session) {
      return {
        mode: 'public',
        token: SERVER_TOKEN,
        fallbackReason: 'not_logged_in',
      }
    }

    // 从 session 获取用户信息
    const user = session.user as { login?: string, id?: string, name?: string | null }
    const viewerLogin = user.login

    if (!viewerLogin) {
      return {
        mode: 'public',
        token: SERVER_TOKEN,
        viewerLogin: undefined,
        fallbackReason: 'token_invalid',
      }
    }

    let userAccessToken: string | undefined

    try {
      const tokenResult = await auth.api.getAccessToken({
        headers: request.headers,
        body: {
          providerId: 'github',
        },
      })
      userAccessToken = tokenResult.accessToken
    }
    catch {
      userAccessToken = undefined
    }

    if (!userAccessToken) {
      return {
        mode: 'public',
        token: SERVER_TOKEN,
        viewerLogin,
        fallbackReason: 'token_missing',
      }
    }

    // 检查请求的 username 是否匹配登录用户（忽略大小写）
    const isMatchingUser = targetUsername.toLowerCase() === viewerLogin.toLowerCase()

    if (!isMatchingUser) {
      return {
        mode: 'public',
        token: SERVER_TOKEN,
        viewerLogin,
        fallbackReason: 'username_mismatch',
      }
    }

    // 用户已登录且请求自己的数据 -> 使用用户 token
    return {
      mode: 'authorized',
      token: userAccessToken,
      viewerLogin,
    }
  }
  catch {
    // Session 解析失败，回退到公开模式
    return {
      mode: 'public',
      token: SERVER_TOKEN,
      fallbackReason: 'token_invalid',
    }
  }
}
