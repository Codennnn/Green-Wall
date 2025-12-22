'use client'

import { type Dispatch, type SetStateAction, useEffect, useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { normalizeGitHubUsername } from '~/helpers'
import { usePersistedSearchInput } from '~/hooks/usePersistedSearchInput'
import { useContributionQuery } from '~/hooks/useQueries'
import { eventTracker } from '~/lib/analytics'
import type { GraphData } from '~/types'

interface UseContributionSearchOptions {
  urlUsername: string
  isInvalidUrlUsername: boolean
  setUsernameInUrl: (username: string, options: { replace: boolean }) => void
  graphData: GraphData | undefined
  setGraphData: Dispatch<SetStateAction<GraphData | undefined>>
  resetSettings: () => void
  addRecentUser: (user: { login: string, avatarUrl: string }) => void
  yearRange?: [start_year: string | undefined, end_year: string | undefined]
}

export function useContributionSearch({
  urlUsername,
  isInvalidUrlUsername,
  setUsernameInUrl,
  setGraphData,
  resetSettings,
  addRecentUser,
  yearRange,
}: UseContributionSearchOptions) {
  const { value: searchName, setValue: setSearchName } = usePersistedSearchInput()

  // 防止重复处理相同数据
  const lastProcessedUsernameRef = useRef<string>('')

  const searchContextRef = useRef<{
    entryPoint: 'url' | 'input_submit' | 'famous_user' | 'recent_user'
    startedAt: number
    username: string
  } | null>(null)

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
    if (urlUsername.length > 0) {
      setSearchName((currentSearchName) => {
        // 只有值不同时才更新，避免中断滚动动画
        return currentSearchName === urlUsername ? currentSearchName : urlUsername
      })
    }
  }, [urlUsername, setSearchName])

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

      const normalizedLogin = contributionData.login
      const context = searchContextRef.current

      let entryPoint: 'url' | 'input_submit' | 'famous_user' | 'recent_user' = 'url'
      let durationMs: number | undefined

      if (context && context.username.toLowerCase() === normalizedLogin.toLowerCase()) {
        entryPoint = context.entryPoint
        durationMs = Date.now() - context.startedAt
      }

      eventTracker.user.search.success(entryPoint, true, durationMs, yearRange)
    }
  }, [contributionData, urlUsername, setGraphData, addRecentUser, setUsernameInUrl, yearRange])

  // 处理 URL 清空
  useEffect(() => {
    if (urlUsername.length === 0 && lastProcessedUsernameRef.current.length > 0) {
      lastProcessedUsernameRef.current = ''
      setGraphData(undefined)
      resetSettings()
    }
  }, [urlUsername, setGraphData, resetSettings])

  // URL 直接进入（或外部导航）时补齐 start 埋点与耗时计算
  useEffect(() => {
    if (!isInvalidUrlUsername && urlUsername.length > 0) {
      const lastProcessed = lastProcessedUsernameRef.current
      const isAlreadyProcessed = (
        lastProcessed.length > 0
        && lastProcessed.toLowerCase() === urlUsername.toLowerCase()
      )
      const context = searchContextRef.current
      const isAlreadyStarted = Boolean(
        context
        && context.username.toLowerCase() === urlUsername.toLowerCase(),
      )

      if (!isAlreadyProcessed && !isAlreadyStarted) {
        searchContextRef.current = {
          entryPoint: 'url',
          startedAt: Date.now(),
          username: urlUsername,
        }

        eventTracker.user.search.start('url', yearRange)
      }
    }
  }, [urlUsername, isInvalidUrlUsername, yearRange])

  useEffect(() => {
    if (isError) {
      lastProcessedUsernameRef.current = ''
      setGraphData(undefined)
      resetSettings()

      const context = searchContextRef.current
      const entryPoint = context?.entryPoint ?? 'url'
      const durationMs = context ? Date.now() - context.startedAt : undefined

      eventTracker.user.search.error(
        String(queryError.errorType),
        queryError.status,
        entryPoint,
        durationMs,
      )
    }
  }, [isError, queryError, setGraphData, resetSettings, urlUsername])

  const handleSubmit = useEvent(() => {
    const username = normalizeGitHubUsername(searchName)

    if (username && !isLoading) {
      resetPreviousUserDataIfNeeded(username)
      setSearchName(username)
      searchContextRef.current = {
        entryPoint: 'input_submit',
        startedAt: Date.now(),
        username,
      }

      eventTracker.user.search.start('input_submit', yearRange)
      setUsernameInUrl(username, { replace: false })
    }
    else if (!username) {
      setSearchName('')
      setUsernameInUrl('', { replace: true })
    }
  })

  const handleQuickSearch = useEvent((raw: string, source: 'famous_user' | 'recent_user') => {
    const username = normalizeGitHubUsername(raw)

    if (username && !isLoading) {
      resetPreviousUserDataIfNeeded(username)
      setSearchName(username)
      searchContextRef.current = {
        entryPoint: source,
        startedAt: Date.now(),
        username,
      }

      eventTracker.user.search.start(source, yearRange)
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
