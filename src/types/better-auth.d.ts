/**
 * 扩展的用户类型，包含 GitHub login 字段
 */
export interface BetterAuthUser {
  id: string
  name: string | null
  email: string | null
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
  /** GitHub 用户名（通过 customSession 注入） */
  login?: string
}

/**
 * 扩展的 Session 类型
 */
export interface BetterAuthSession {
  id: string
  userId: string
  expiresAt: Date
  ipAddress?: string
  userAgent?: string
}

/**
 * 完整的 Session 响应类型
 */
export interface BetterAuthSessionResponse {
  user: BetterAuthUser
  session: BetterAuthSession
}
