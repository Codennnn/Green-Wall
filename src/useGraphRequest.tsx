import { useCallback, useState } from 'react'
import useEvent from 'react-use-event-hook'

import { setSearchParamsToUrl, trackEvent } from './helpers'
import type { ContributionYear, ResponseData } from './types'

interface UseGraphRequestConfig {
  onError?: () => void
}

export function useGraphRequest(config: UseGraphRequestConfig = {}) {
  const onError = useEvent(() => {
    config.onError?.()
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<Pick<ResponseData, 'errorType' | 'message'>>()

  const run = useCallback(
    async ({ username, years }: { username: string; years?: ContributionYear[] }) => {
      try {
        setError(undefined)
        setLoading(true)

        const requestUrl = setSearchParamsToUrl({
          url: `/api/contribution/${username}`,
          paramName: 'years',
          paramValue: years?.map((year) => year.toString()) || [],
        })

        const res = await fetch(requestUrl)
        const resJson: ResponseData = await res.json()

        if (res.ok) {
          return resJson.data
        } else {
          setError({ errorType: resJson.errorType, message: resJson.message })
        }
      } catch (err) {
        if (err instanceof Error) {
          trackEvent('Error: Fetch Ccontribution Data', { msg: err.message })
        }
        onError()
      } finally {
        setLoading(false)
      }
    },
    [onError]
  )

  return {
    run,
    loading,
    error,
  }
}
