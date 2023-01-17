import { useCallback, useState } from 'react'

import useEvent from 'react-use-event-hook'

import { trackEvent } from './helpers'
import type { ResponseData } from './types'

export function useGraphRequest(config: { onError?: () => void } = {}) {
  const onError = useEvent(() => {
    config.onError?.()
  })

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<Pick<ResponseData, 'errorType' | 'message'>>()

  const run = useCallback(
    async ({ username }: { username: string }) => {
      try {
        setError(undefined)
        setLoading(true)

        const res = await fetch(`/api/contribution/${username}`)
        const resJson: ResponseData = await res.json()

        if (res.ok) {
          return resJson.data
        } else {
          setError({ errorType: resJson.errorType, message: resJson.message })
        }
      } catch (e) {
        if (e instanceof Error) {
          trackEvent('Error: Fetch Ccontribution Data', { msg: e.message })
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
