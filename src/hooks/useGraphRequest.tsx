import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useQueryClient } from '@tanstack/react-query'

import { eventTracker } from '~/lib/analytics'
import { ApiError } from '~/lib/api-client'
import { fetchContributionData, queryKeys } from '~/services/api'
import type { ContributionYear, ResponseData } from '~/types'

interface UseGraphRequestConfig {
  onError?: () => void
}

interface GraphRequestParams {
  username: string
  years?: ContributionYear[]
}

const CONTRIBUTION_STALE_TIME_MS = 10 * 60 * 1000

function normalizeYears(years: ContributionYear[] | undefined) {
  return years && years.length > 0 ? years : undefined
}

export function useGraphRequest(config?: UseGraphRequestConfig) {
  const queryClient = useQueryClient()
  const pendingRequestCountRef = useRef(0)
  const onError = useEvent(() => {
    config?.onError?.()
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<Pick<ResponseData, 'errorType' | 'message'>>()

  const run = useEvent(
    async ({ username, years }: GraphRequestParams) => {
      const normalizedYears = normalizeYears(years)

      pendingRequestCountRef.current += 1
      setError(undefined)

      if (pendingRequestCountRef.current === 1) {
        setLoading(true)
      }

      try {
        const result = await queryClient.fetchQuery({
          queryKey: queryKeys.contribution(username, normalizedYears),
          queryFn: () => fetchContributionData(username, normalizedYears),
          staleTime: CONTRIBUTION_STALE_TIME_MS,
        })

        return result.data
      }
      catch (err) {
        if (err instanceof ApiError) {
          setError({ errorType: err.errorType, message: err.message })

          return undefined
        }

        setError({
          message: err instanceof Error
            ? err.message
            : 'Failed to fetch contribution data',
        })
        eventTracker.api.error(
          'contribution_data',
          0, // 没有具体 HTTP 状态码
          'fetch_error',
        )
        onError()

        return undefined
      }
      finally {
        pendingRequestCountRef.current -= 1

        if (pendingRequestCountRef.current <= 0) {
          pendingRequestCountRef.current = 0
          setLoading(false)
        }
      }
    },
  )

  return {
    run,
    loading,
    error,
  }
}
