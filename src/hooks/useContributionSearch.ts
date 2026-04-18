'use client'

import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef } from 'react'
import { useEvent } from 'react-use-event-hook'

import { normalizeGitHubUsername } from '~/helpers'
import {
  clearPersistedSearchInput,
  usePersistedSearchInput,
} from '~/hooks/usePersistedSearchInput'
import { useContributionQuery } from '~/hooks/useQueries'
import { eventTracker } from '~/lib/analytics'
import type { GraphData } from '~/types'

type SearchEntryPoint = 'url' | 'input_submit' | 'famous_user' | 'recent_user'
type SearchYearRange = [start_year: string | undefined, end_year: string | undefined]

const CONTRIBUTION_SEARCH_STALE_TIME_MS = 10 * 60 * 1000
const CONTRIBUTION_SEARCH_GC_TIME_MS = 60 * 60 * 1000

function isSameUsername(left: string, right: string): boolean {
  return left.toLowerCase() === right.toLowerCase()
}

interface UseContributionSearchOptions {
  urlUsername: string
  isInvalidUrlUsername: boolean
  setUsernameInUrl: (username: string, options: { replace: boolean }) => void
  graphData: GraphData | undefined
  setGraphData: Dispatch<SetStateAction<GraphData | undefined>>
  resetSettings: () => void
  addRecentUser: (user: { login: string, avatarUrl: string }) => void
  yearRange?: SearchYearRange
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
  const {
    value: searchName,
    setValue: setSearchName,
    setValueWithoutPersist: setSearchNameWithoutPersist,
  } = usePersistedSearchInput()

  // 防止重复处理相同数据
  const lastProcessedUsernameRef = useRef<string>('')

  const searchContextRef = useRef<{
    entryPoint: SearchEntryPoint
    startedAt: number
    username: string
  } | null>(null)

  const [yearRangeStart, yearRangeEnd] = yearRange ?? []
  const analyticsYearRange = useMemo<SearchYearRange | undefined>(() => {
    if (yearRangeStart === undefined && yearRangeEnd === undefined) {
      return undefined
    }

    return [yearRangeStart, yearRangeEnd]
  }, [yearRangeStart, yearRangeEnd])

  const resetUserData = useEvent(() => {
    lastProcessedUsernameRef.current = ''
    setGraphData(undefined)
    resetSettings()
  })

  const resetPreviousUserDataIfNeeded = useEvent((nextUsername: string) => {
    const lastProcessed = lastProcessedUsernameRef.current

    if (
      lastProcessed.length === 0
      || nextUsername.length === 0
      || isSameUsername(nextUsername, lastProcessed)
    ) {
      return
    }

    resetUserData()
  })

  const isContributionQueryEnabled = urlUsername.length > 0 && !isInvalidUrlUsername
  const contributionQueryOptions = useMemo(
    () => ({
      enabled: isContributionQueryEnabled,
      staleTime: CONTRIBUTION_SEARCH_STALE_TIME_MS,
      gcTime: CONTRIBUTION_SEARCH_GC_TIME_MS,
    }),
    [isContributionQueryEnabled],
  )

  const {
    data: contributionResult,
    isLoading,
    error: queryError,
    isError,
  } = useContributionQuery(urlUsername, undefined, false, undefined, contributionQueryOptions)
  const contributionData = contributionResult?.data

  // 同步 URL 用户名到输入框（不写入 localStorage，避免覆盖 clearPersistedSearchInput 的效果）
  useEffect(() => {
    if (urlUsername.length > 0) {
      setSearchNameWithoutPersist((currentSearchName) => {
        // 只有值不同时才更新，避免中断滚动动画
        return currentSearchName === urlUsername
          ? currentSearchName
          : urlUsername
      })
    }
  }, [urlUsername, setSearchNameWithoutPersist])

  useEffect(() => {
    resetPreviousUserDataIfNeeded(urlUsername)
  }, [urlUsername, resetPreviousUserDataIfNeeded])

  // 处理无效 URL 用户名
  useEffect(() => {
    if (!isInvalidUrlUsername) {
      return
    }

    setUsernameInUrl('', { replace: true })
  }, [isInvalidUrlUsername, setUsernameInUrl])

  useEffect(() => {
    if (!contributionData) {
      return
    }

    const { login, avatarUrl } = contributionData

    if (login === lastProcessedUsernameRef.current) {
      return
    }

    lastProcessedUsernameRef.current = login
    setGraphData(contributionData)

    addRecentUser({
      login,
      avatarUrl,
    })

    if (login !== urlUsername) {
      setUsernameInUrl(login, { replace: true })
    }

    const context = searchContextRef.current
    let entryPoint: SearchEntryPoint = 'url'
    let durationMs: number | undefined

    if (context && isSameUsername(context.username, login)) {
      entryPoint = context.entryPoint
      durationMs = Date.now() - context.startedAt
    }

    searchContextRef.current = null
    eventTracker.user.search.success(entryPoint, true, durationMs, analyticsYearRange)
  }, [
    contributionData,
    urlUsername,
    setGraphData,
    addRecentUser,
    setUsernameInUrl,
    analyticsYearRange,
  ])

  // 处理 URL 清空
  useEffect(() => {
    if (
      urlUsername.length > 0
      || lastProcessedUsernameRef.current.length === 0
    ) {
      return
    }

    resetUserData()
  }, [urlUsername, resetUserData])

  // URL 直接进入（或外部导航）时补齐 start 埋点与耗时计算
  useEffect(() => {
    if (isInvalidUrlUsername || urlUsername.length === 0) {
      return
    }

    const lastProcessed = lastProcessedUsernameRef.current
    const isAlreadyProcessed
      = lastProcessed.length > 0 && isSameUsername(lastProcessed, urlUsername)
    const context = searchContextRef.current
    const isAlreadyStarted
      = context ? isSameUsername(context.username, urlUsername) : false

    if (isAlreadyProcessed || isAlreadyStarted) {
      return
    }

    searchContextRef.current = {
      entryPoint: 'url',
      startedAt: Date.now(),
      username: urlUsername,
    }

    eventTracker.user.search.start('url', analyticsYearRange)
  }, [urlUsername, isInvalidUrlUsername, analyticsYearRange])

  useEffect(() => {
    if (!isError) {
      return
    }

    resetUserData()

    const context = searchContextRef.current
    const entryPoint = context?.entryPoint ?? 'url'
    const durationMs = context ? Date.now() - context.startedAt : undefined

    searchContextRef.current = null
    eventTracker.user.search.error(
      String(queryError.errorType),
      queryError.status,
      entryPoint,
      durationMs,
    )
  }, [isError, queryError, resetUserData])

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

      eventTracker.user.search.start('input_submit', analyticsYearRange)
      setUsernameInUrl(username, { replace: false })
    }
    else if (!username) {
      setSearchName('')
      setUsernameInUrl('', { replace: true })
    }
  })

  const handleQuickSearch = useEvent(
    (raw: string, source: Extract<SearchEntryPoint, 'famous_user' | 'recent_user'>) => {
      const username = normalizeGitHubUsername(raw)

      if (username && !isLoading) {
        resetPreviousUserDataIfNeeded(username)
        // 使用不持久化的方法设置值，保证搜索框显示用户名但不写入 localStorage
        setSearchNameWithoutPersist(username)
        // 确保 localStorage 中没有残留的搜索输入
        clearPersistedSearchInput()
        searchContextRef.current = {
          entryPoint: source,
          startedAt: Date.now(),
          username,
        }

        eventTracker.user.search.start(source, analyticsYearRange)
        setUsernameInUrl(username, { replace: false })
      }
    },
  )

  const error = useMemo(() => {
    if (!isError) {
      return undefined
    }

    return {
      errorType: queryError.errorType,
      message: queryError.message,
    }
  }, [isError, queryError])

  return {
    searchName,
    setSearchName,
    isLoading,
    error,
    handleSubmit,
    handleQuickSearch,
  }
}
