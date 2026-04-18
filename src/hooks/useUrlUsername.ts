'use client'

import { useEvent } from 'react-use-event-hook'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { normalizeGitHubUsername } from '~/helpers'

export function useUrlUsername() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParamsString = searchParams.toString()
  const rawUrlUsername = searchParams.get('username') ?? ''
  const normalizedUrlUsername = normalizeGitHubUsername(rawUrlUsername)
  const urlUsername = normalizedUrlUsername ?? ''
  const isInvalidUrlUsername = rawUrlUsername.length > 0 && normalizedUrlUsername === null

  const setUsernameInUrl = useEvent(
    (nextUsername: string, { replace }: { replace: boolean }) => {
      const nextParams = new URLSearchParams(searchParamsString)
      const currentUsername = nextParams.get('username') ?? ''

      if (currentUsername === nextUsername) {
        return
      }

      if (nextUsername.length > 0) {
        nextParams.set('username', nextUsername)
      }
      else {
        nextParams.delete('username')
      }

      const nextSearch = nextParams.toString()
      const nextUrl = nextSearch ? `${pathname}?${nextSearch}` : pathname

      if (replace) {
        router.replace(nextUrl, { scroll: false })

        return
      }

      router.push(nextUrl, { scroll: false })
    },
  )

  return {
    urlUsername,
    rawUrlUsername,
    isInvalidUrlUsername,
    setUsernameInUrl,
  }
}
