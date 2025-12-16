'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { normalizeGitHubUsername, trackEvent } from '~/helpers'
import { useContributionQuery } from '~/hooks/useQueries'
import type { GitHubUsername, GraphData } from '~/types'

interface UseContributionSearchOptions {
  urlUsername: string
  isInvalidUrlUsername: boolean
  setUsernameInUrl: (username: string, options: { replace: boolean }) => void
  graphData: GraphData | undefined
  setGraphData: Dispatch<SetStateAction<GraphData | undefined>>
  resetSettings: () => void
  addRecentUser: (user: { login: string, avatarUrl: string }) => void
}

export function useContributionSearch({
  urlUsername,
  isInvalidUrlUsername,
  setUsernameInUrl,
  setGraphData,
  resetSettings,
  addRecentUser,
}: UseContributionSearchOptions) {
  const [searchName, setSearchName] = useState<GitHubUsername>('')

  // 防止重复处理相同数据
  const lastProcessedUsernameRef = useRef<string>('')

  const resetPreviousUserDataIfNeeded = useEvent((nextUsername: string) => {
    const lastProcessed = lastProcessedUsernameRef.current

    const hasPreviousUser = lastProcessed.length > 0
    const isSwitchingToAnotherUser
      = nextUsername.length > 0
        && nextUsername.toLowerCase() !== lastProcessed.toLowerCase()

    if (hasPreviousUser && isSwitchingToAnotherUser) {
      lastProcessedUsernameRef.current = ''
      setGraphData(undefined)
      resetSettings()
    }
  })

  const {
    data: contributionData,
    isLoading,
    error: queryError,
    isError,
  } = useContributionQuery(
    urlUsername,
    undefined,
    false,
    {
      enabled: urlUsername.length > 0 && !isInvalidUrlUsername,
      staleTime: 10 * 60 * 1000, // 10 分钟
      gcTime: 60 * 60 * 1000, // 1 小时
    },
  )

  // 同步 URL 用户名到输入框
  useEffect(() => {
    setSearchName((currentSearchName) => {
      const targetValue = urlUsername.length > 0 ? urlUsername : ''

      // 只有值不同时才更新，避免中断滚动动画
      return currentSearchName === targetValue ? currentSearchName : targetValue
    })
  }, [urlUsername])

  useEffect(() => {
    resetPreviousUserDataIfNeeded(urlUsername)
  }, [urlUsername, resetPreviousUserDataIfNeeded])

  // 处理无效 URL 用户名
  useEffect(() => {
    if (isInvalidUrlUsername) {
      setUsernameInUrl('', { replace: true })
    }
  }, [isInvalidUrlUsername, setUsernameInUrl])

  useEffect(() => {
    if (contributionData && contributionData.login !== lastProcessedUsernameRef.current) {
      lastProcessedUsernameRef.current = contributionData.login
      setGraphData(contributionData)

      addRecentUser({
        login: contributionData.login,
        avatarUrl: contributionData.avatarUrl,
      })

      if (contributionData.login !== urlUsername) {
        setUsernameInUrl(contributionData.login, { replace: true })
      }
    }
  }, [contributionData, urlUsername, setGraphData, addRecentUser, setUsernameInUrl])

  // 处理 URL 清空
  useEffect(() => {
    if (urlUsername.length === 0 && lastProcessedUsernameRef.current.length > 0) {
      lastProcessedUsernameRef.current = ''
      setGraphData(undefined)
      resetSettings()
    }
  }, [urlUsername, setGraphData, resetSettings])

  useEffect(() => {
    if (isError) {
      lastProcessedUsernameRef.current = ''
      setGraphData(undefined)
      resetSettings()
    }
  }, [isError, setGraphData, resetSettings])

  const handleSubmit = useEvent(() => {
    const username = normalizeGitHubUsername(searchName)

    if (username && !isLoading) {
      resetPreviousUserDataIfNeeded(username)
      setSearchName(username)
      trackEvent('Click Generate')
      setUsernameInUrl(username, { replace: false })
    }
    else if (!username) {
      setSearchName('')
      setUsernameInUrl('', { replace: true })
    }
  })

  const handleQuickSearch = useEvent((raw: string) => {
    const username = normalizeGitHubUsername(raw)

    if (username && !isLoading) {
      resetPreviousUserDataIfNeeded(username)
      setSearchName(username)
      trackEvent('Click Quick Search', { username })
      setUsernameInUrl(username, { replace: false })
    }
  })

  const error = isError
    ? {
        errorType: queryError.errorType,
        message: queryError.message,
      }
    : undefined

  return {
    searchName,
    setSearchName,
    isLoading,
    error,
    handleSubmit,
    handleQuickSearch,
  }
}
