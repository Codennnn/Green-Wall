import { toNextJsHandler } from 'better-auth/next-js'

import { auth } from '~/auth/index'

/**
 * Better Auth API 路由
 *
 * 处理所有 /api/auth/* 请求：
 * - /api/auth/sign-in/social - 社交登录
 * - /api/auth/callback/github - OAuth 回调
 * - /api/auth/sign-out - 登出
 * - /api/auth/get-session - 获取 session
 */
export const { GET, POST } = toNextJsHandler(auth)
