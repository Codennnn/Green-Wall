'use client'

import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

import { routing } from '~/i18n/routing'

export function BgDecoration() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname) {
      return
    }

    let pathWithoutLocale = pathname

    for (const locale of routing.locales) {
      const localePrefix = `/${locale}`

      if (pathname === localePrefix || pathname.startsWith(`${localePrefix}/`)) {
        pathWithoutLocale = pathname.slice(localePrefix.length) || '/'
        break
      }
    }

    const shouldAddDecoration = pathWithoutLocale === '/'
      || pathWithoutLocale.startsWith('/share')
      || pathWithoutLocale.startsWith('/year')

    if (shouldAddDecoration) {
      const appContainer = document.getElementById('app-container')

      appContainer?.classList.add('bg-decoration')

      return () => {
        appContainer?.classList.remove('bg-decoration')
      }
    }
  }, [pathname])

  return null
}
