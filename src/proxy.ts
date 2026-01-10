import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // 匹配所有路径，排除：
  // - /api, /trpc, /_next, /_vercel 开头的路径
  // - /test 开头的路径（开发测试页面，不需要国际化）
  // - 包含点号的路径 (静态文件如 favicon.ico)
  matcher: '/((?!api|trpc|_next|_vercel|test|.*\\..*).*)',
}
