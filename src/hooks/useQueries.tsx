import { useMemo } from 'react'

import {
  useQueries,
  useQuery,
  type UseQueryOptions,
} from '@tanstack/react-query'

import type { ApiError } from '~/lib/api-client'
import {
  fetchContributionData,
  fetchIssuesInYear,
  fetchRepoAnalysis,
  fetchRepoInteractionsInYear,
  fetchReposInYear,
  queryKeys,
} from '~/services/api'
import type {
  ContributionApiResponse,
  ContributionYear,
  DataAccessOptions,
  GitHubUsername,
  IssuesInYear,
  RepoAnalysisResponse,
  RepoCreatedInYear,
  RepoInteractionsInYear,
} from '~/types'

function resolveEnabled<TEnabled>(
  defaultEnabled: boolean,
  optionEnabled: TEnabled | undefined,
): boolean | TEnabled {
  if (!defaultEnabled) {
    return false
  }

  return optionEnabled ?? true
}

export function useContributionQuery(
  username: GitHubUsername,
  years?: ContributionYear[],
  statistics = false,
  accessOptions?: DataAccessOptions,
  options?: Omit<
    UseQueryOptions<ContributionApiResponse, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.contribution(
      username,
      years,
      statistics,
      accessOptions,
    ),
    queryFn: () =>
      fetchContributionData(username, years, statistics, accessOptions),
    enabled: resolveEnabled(username.length > 0, options?.enabled),
  })
}

export function useReposQuery(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
  options?: Omit<
    UseQueryOptions<RepoCreatedInYear, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.repos(username, year, accessOptions),
    queryFn: () => fetchReposInYear(username, year, accessOptions),
    enabled: resolveEnabled(
      username.length > 0 && Number.isFinite(year),
      options?.enabled,
    ),
  })
}

export function useIssuesQuery(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
  options?: Omit<
    UseQueryOptions<IssuesInYear, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    ...options,
    queryKey: queryKeys.issues(username, year, accessOptions),
    queryFn: () => fetchIssuesInYear(username, year, accessOptions),
    enabled: resolveEnabled(
      username.length > 0 && Number.isFinite(year),
      options?.enabled,
    ),
  })
}

/**
 * 获取用户在指定年份与各仓库的交互统计
 */
export function useRepoInteractionsQuery(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
  options?: Omit<
    UseQueryOptions<RepoInteractionsInYear, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<RepoInteractionsInYear, ApiError>({
    ...options,
    queryKey: queryKeys.repoInteractions(username, year, accessOptions),
    queryFn: () => fetchRepoInteractionsInYear(username, year, accessOptions),
    enabled: resolveEnabled(
      username.length > 0 && Number.isFinite(year),
      options?.enabled,
    ),
  })
}

/**
 * 组合查询 Hook - 并行获取用户的多种数据
 */
export function useUserDataQueries(
  username: GitHubUsername,
  year?: ContributionYear,
  options?: {
    contribution?: Omit<
      UseQueryOptions<ContributionApiResponse, ApiError>,
      'queryKey' | 'queryFn'
    >
    repos?: Omit<
      UseQueryOptions<RepoCreatedInYear, ApiError>,
      'queryKey' | 'queryFn'
    >
    issues?: Omit<
      UseQueryOptions<IssuesInYear, ApiError>,
      'queryKey' | 'queryFn'
    >
  },
) {
  const contributionOptions = options?.contribution
  const reposOptions = options?.repos
  const issuesOptions = options?.issues
  const contributionYears = useMemo(() => {
    if (year === undefined || !Number.isFinite(year)) {
      return undefined
    }

    return [year]
  }, [year])
  const queryYear = contributionYears?.[0]

  const queries = useMemo(() => {
    const contributionQuery = {
      ...contributionOptions,
      queryKey: queryKeys.contribution(username, contributionYears),
      queryFn: () => fetchContributionData(username, contributionYears),
      enabled: resolveEnabled(
        username.length > 0,
        contributionOptions?.enabled,
      ),
    }

    if (queryYear === undefined) {
      return [contributionQuery]
    }

    return [
      contributionQuery,
      {
        ...reposOptions,
        queryKey: queryKeys.repos(username, queryYear),
        queryFn: () => fetchReposInYear(username, queryYear),
        enabled: resolveEnabled(username.length > 0, reposOptions?.enabled),
      },
      {
        ...issuesOptions,
        queryKey: queryKeys.issues(username, queryYear),
        queryFn: () => fetchIssuesInYear(username, queryYear),
        enabled: resolveEnabled(username.length > 0, issuesOptions?.enabled),
      },
    ]
  }, [
    username,
    contributionYears,
    queryYear,
    contributionOptions,
    reposOptions,
    issuesOptions,
  ])

  const results = useQueries({ queries })
  const queryState = useMemo(() => {
    let isLoading = false
    let isError = false
    const errors: ApiError[] = []

    for (const result of results) {
      isLoading ||= result.isLoading
      isError ||= result.isError

      if (result.error) {
        errors.push(result.error)
      }
    }

    return {
      isLoading,
      isError,
      errors,
    }
  }, [results])

  return {
    contribution: results[0],
    repos: queryYear === undefined ? undefined : results[1],
    issues: queryYear === undefined ? undefined : results[2],
    // 便捷的状态聚合
    ...queryState,
  }
}

/**
 * 获取单个仓库的深度分析数据
 */
export function useRepoAnalysisQuery(
  owner: string,
  repo: string,
  metrics?: ('basic' | 'health' | 'techstack')[],
  accessOptions?: DataAccessOptions,
  options?: Omit<
    UseQueryOptions<RepoAnalysisResponse, ApiError>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: queryKeys.repoAnalysis(owner, repo, metrics, accessOptions),
    queryFn: () => fetchRepoAnalysis(owner, repo, metrics, accessOptions),
    staleTime: 1000 * 60 * 5, // 5 分钟
    gcTime: 1000 * 60 * 30, // 30 分钟（gcTime 是 cacheTime 的新名称）
    refetchOnWindowFocus: false,
    ...options,
    enabled: resolveEnabled(
      owner.length > 0 && repo.length > 0,
      options?.enabled,
    ),
  })
}
