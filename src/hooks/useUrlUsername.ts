'use client'

import { useEvent } from 'react-use-event-hook'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { normalizeGitHubUsername } from '~/helpers'

export function useUrlUsername() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const rawUrlUsername = searchParams.get('username') ?? ''
  const urlUsername = normalizeGitHubUsername(rawUrlUsername) ?? ''

  const setUsernameInUrl = useEvent(
    (nextUsername: string, { replace }: { replace: boolean }) => {
      const currentUsername = searchParams.get('username') ?? ''

      const shouldUpdate = currentUsername !== nextUsername

      if (shouldUpdate) {
        const nextParams = new URLSearchParams(searchParams.toString())

        if (nextUsername.length > 0) {
          nextParams.set('username', nextUsername)
        }
        else {
          nextParams.delete('username')
        }

        const url = new URL(pathname, window.location.origin)
        url.search = nextParams.toString()

        const nextUrl = url.pathname + url.search

        if (replace) {
          router.replace(nextUrl)
        }
        else {
          router.push(nextUrl)
        }
      }
    },
  )

  const isInvalidUrlUsername = rawUrlUsername.length > 0 && !normalizeGitHubUsername(rawUrlUsername)

  return {
    urlUsername,
    rawUrlUsername,
    isInvalidUrlUsername,
    setUsernameInUrl,
  }
}
