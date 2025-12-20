'use client'

import { useCallback, useRef, useState } from 'react'

import { normalizeGitHubUsername } from '~/helpers'
import { useRouter } from '~/i18n/navigation'
import { eventTracker } from '~/lib/analytics'

interface NavigateParams {
  year: number
  username: string
}

interface UseYearWrappedNavigationResult {
  isNavigating: boolean
  navigateToYearUser: (params: NavigateParams) => boolean
}

export function useYearWrappedNavigation(): UseYearWrappedNavigationResult {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationStartTimeRef = useRef<number>(0)

  const navigateToYearUser = useCallback(
    ({ year, username }: NavigateParams): boolean => {
      const normalizedUsername = normalizeGitHubUsername(username)

      if (!normalizedUsername || !year) {
        return false
      }

      navigationStartTimeRef.current = performance.now()
      eventTracker.year.navigate.start(year)

      setIsNavigating(true)
      router.push(`/year/${year}/${normalizedUsername}`)

      return true
    },
    [router],
  )

  return {
    isNavigating,
    navigateToYearUser,
  }
}
