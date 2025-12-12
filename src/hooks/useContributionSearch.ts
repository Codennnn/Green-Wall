'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { normalizeGitHubUsername, trackEvent } from '~/helpers'
import { useContributionQuery } from '~/hooks/useQueries'
import type { ContributionYear, GitHubUsername, GraphData } from '~/types'

interface UseContributionSearchOptions {
  urlUsername: string
  isInvalidUrlUsername: boolean
  setUsernameInUrl: (username: string, options: { replace: boolean }) => void
  graphData: GraphData | undefined
  setGraphData: Dispatch<SetStateAction<GraphData | undefined>>
  resetSettings: () => void
  addRecentUser: (user: { login: string, avatarUrl: string }) => void
}

interface QueryParams {
  username: GitHubUsername
  years?: ContributionYear[]
}

export function useContributionSearch({
  urlUsername,
  isInvalidUrlUsername,
  setUsernameInUrl,
  graphData,
  setGraphData,
  resetSettings,
  addRecentUser,
}: UseContributionSearchOptions) {
  const [searchName, setSearchName] = useState<GitHubUsername>('')
  const searchNameRef = useRef<GitHubUsername>('')
  const [queryParams, setQueryParams] = useState<QueryParams | null>(null)

  useEffect(() => {
    searchNameRef.current = searchName
  }, [searchName])

  const reset = useEvent(() => {
    setGraphData(undefined)
    resetSettings()
  })

  const handleError = useEvent(() => {
    reset()
    setQueryParams(null)
    setSearchName('')
    setUsernameInUrl('', { replace: true })
  })

  const {
    data: contributionData,
    isLoading,
    error: queryError,
    isError,
  } = useContributionQuery(
    queryParams?.username ?? '',
    queryParams?.years,
    false,
    {
      enabled: !!queryParams?.username,
    },
  )

  useEffect(() => {
    if (isInvalidUrlUsername) {
      setUsernameInUrl('', { replace: true })

      return
    }

    const graphUsername = graphData?.login ?? ''
    const queryUsername = queryParams?.username ?? ''

    if (urlUsername.length > 0) {
      if (searchNameRef.current !== urlUsername) {
        setSearchName(urlUsername)
      }

      if (graphUsername !== urlUsername && queryUsername !== urlUsername) {
        reset()
        setQueryParams({ username: urlUsername })
      }
    }
    else {
      if (graphData) {
        reset()
      }

      if (searchNameRef.current.length > 0) {
        setSearchName('')
      }

      if (queryParams) {
        setQueryParams(null)
      }
    }
  }, [
    urlUsername,
    isInvalidUrlUsername,
    graphData,
    queryParams,
    reset,
    setUsernameInUrl,
  ])

  useEffect(() => {
    if (contributionData && queryParams) {
      setSearchName(contributionData.login)
      setUsernameInUrl(contributionData.login, { replace: true })
      setGraphData(contributionData)
      addRecentUser({
        login: contributionData.login,
        avatarUrl: contributionData.avatarUrl,
      })
      setQueryParams(null)
    }
  }, [addRecentUser, contributionData, queryParams, setGraphData, setUsernameInUrl])

  useEffect(() => {
    if (isError) {
      handleError()
    }
  }, [isError, handleError])

  const error = isError
    ? {
        errorType: queryError.errorType,
        message: queryError.message,
      }
    : undefined

  const handleSubmit = useEvent(() => {
    const username = normalizeGitHubUsername(searchName)

    if (username && !isLoading) {
      reset()
      trackEvent('Click Generate')
      setUsernameInUrl(username, { replace: false })
    }
    else if (!username) {
      reset()
      setSearchName('')
      setUsernameInUrl('', { replace: true })
    }
  })

  const handleQuickSearch = useEvent((raw: string) => {
    const username = normalizeGitHubUsername(raw)

    if (username && !isLoading) {
      reset()
      setSearchName(username)
      trackEvent('Click Quick Search', { username })
      setUsernameInUrl(username, { replace: false })
    }
  })

  return {
    searchName,
    setSearchName,
    isLoading,
    error,
    queryParams,
    reset,
    handleSubmit,
    handleQuickSearch,
  }
}
