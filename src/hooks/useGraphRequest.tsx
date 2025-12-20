import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { setSearchParamsToUrl } from '~/helpers'
import { eventTracker } from '~/lib/analytics'
import type { ContributionYear, ResponseData } from '~/types'

interface UseGraphRequestConfig {
  onError?: () => void
}

export function useGraphRequest(config: UseGraphRequestConfig = {}) {
  const onError = useEvent(() => {
    config.onError?.()
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<Pick<ResponseData, 'errorType' | 'message'>>()

  const run = useEvent(
    async ({ username, years }: { username: string, years?: ContributionYear[] }) => {
      try {
        setError(undefined)
        setLoading(true)

        const requestUrl = setSearchParamsToUrl({
          url: `/api/contribution/${username}`,
          paramName: 'years',
          paramValue: years?.map((year) => year.toString()) ?? [],
        })

        const res = await fetch(requestUrl)
        const resJson = await res.json() as ResponseData

        if (res.ok) {
          return resJson.data
        }
        else {
          setError({ errorType: resJson.errorType, message: resJson.message })
        }
      }
      catch (err) {
        if (err instanceof Error) {
          eventTracker.api.error(
            'contribution_data',
            0, // 没有具体HTTP状态码
            'fetch_error',
          )
        }

        onError()
      }
      finally {
        setLoading(false)
      }
    },
  )

  return {
    run,
    loading,
    error,
  }
}
