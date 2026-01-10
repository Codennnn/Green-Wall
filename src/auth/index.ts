import { betterAuth } from 'better-auth'
import { customSession } from 'better-auth/plugins'

/** Session 有效期：30 天（秒） */
const SESSION_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Better Auth 实例
 *
 * 运行模式：Stateless（无数据库）
 * - Session 数据存储在签名的 JWT cookie 中，服务器无需查询数据库即可验证
 * - GitHub access token 存储在加密的 account cookie 中，不暴露给客户端
 * - 通过 customSession 插件扩展 session，注入 GitHub login 字段
 */
export const auth = betterAuth({
  /** 用于签名和加密 cookie 的密钥 */
  secret: process.env.AUTH_SECRET,

  /** 服务的公开 URL，用于生成 OAuth 回调地址 */
  baseURL: process.env.AUTH_URL,

  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
      scope: ['read:user', 'user:email', 'repo'],
      mapProfileToUser: (profile) => ({
        name: profile.name || profile.login,
        email: profile.email,
        image: profile.avatar_url,
        login: profile.login,
      }),
    },
  },

  user: {
    additionalFields: {
      /** GitHub 用户名，用于匹配请求的目标用户 */
      login: {
        type: 'string',
        required: false,
        input: false,
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: SESSION_MAX_AGE,
      strategy: 'jwt',
      refreshCache: true,
    },
  },

  account: {
    /** 将 OAuth provider 的 access token 存储在加密 cookie 中 */
    storeAccountCookie: true,
    /** 每次登录时更新 token，确保使用最新凭证 */
    updateAccountOnSignIn: true,
  },

  /** OAuth 错误处理：重定向到自定义错误页面 */
  onAPIError: {
    errorURL: '/auth/error',
    onError: (error) => {
      // 将网络超时等错误记录到服务器日志
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('[Auth Error]', errorMessage)
    },
  },

  plugins: [
    // eslint-disable-next-line @typescript-eslint/require-await
    customSession(async ({ user, session }) => ({
      session,
      user: {
        ...user,
        login: (user as { login?: string }).login,
      },
    })),
  ],
})

export type Auth = typeof auth
