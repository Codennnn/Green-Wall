import { betterAuth } from 'better-auth'
import { customSession } from 'better-auth/plugins'

/**
 * Better Auth 配置
 *
 * - 使用 GitHub Provider + Stateless 模式（无需数据库）
 * - access token 存储于 account cookie，不暴露给客户端
 * - session 只暴露 login/name/image 等公开信息
 * - 通过 customSession 插件注入 user.login 字段
 */
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET,

  baseURL: process.env.AUTH_URL,

  // GitHub OAuth 配置
  socialProviders: {
    github: {
      clientId: process.env.AUTH_GITHUB_ID ?? '',
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? '',
      // 保持与原 NextAuth 相同的 scope：读取用户信息、邮箱、私有仓库
      scope: ['read:user', 'user:email', 'repo'],
      // 将 GitHub profile 数据映射到用户字段
      mapProfileToUser: (profile) => {
        return {
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          // 存储 GitHub login（用户名）到 additionalFields
          login: profile.login,
        }
      },
    },
  },

  // 用户配置：添加 login 字段
  user: {
    additionalFields: {
      login: {
        type: 'string',
        required: false,
        input: false, // 不允许用户在注册时输入
      },
    },
  },

  // 账户配置
  account: {
    // 在无数据库模式下，将账户信息存储在 cookie 中（包含 access token）
    storeAccountCookie: true,
    // 每次登录时更新账户信息（确保 token 是最新的）
    updateAccountOnSignIn: true,
  },

  // Session 配置
  session: {
    // 启用 cookie 缓存以优化性能
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 分钟
      strategy: 'jwt',
    },
  },

  // 插件配置
  plugins: [
    // 自定义 session 返回结构，确保 user.login 可用
    // eslint-disable-next-line @typescript-eslint/require-await
    customSession(async ({ user, session }) => {
      return {
        session,
        user: {
          ...user,
          // 确保 login 字段在 session 中可访问
          login: (user as { login?: string }).login ?? undefined,
        },
      }
    }),
  ],
})

// 导出 auth 类型供客户端使用
export type Auth = typeof auth
