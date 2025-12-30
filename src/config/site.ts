export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://green-wall.leoku.dev',
} as const

export function getAbsoluteURL(path = '') {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`
}
