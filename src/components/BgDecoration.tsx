'use client'

import { useEffect } from 'react'

import { usePathname } from 'next/navigation'

export function BgDecoration() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname && (pathname === '/' || pathname.startsWith('/share'))) {
      window.document.body.classList.add('bg-decoration')

      return () => {
        window.document.body.classList.remove('bg-decoration')
      }
    }
  }, [pathname])

  return null
}
