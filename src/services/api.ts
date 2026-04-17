import { eventTracker } from '~/lib/analytics'
import { apiClient, ApiError } from '~/lib/api-client'
import type {
  ContributionApiResponse,
  ContributionYear,
  DataAccessOptions,
  GitHubUsername,
  IssuesInYear,
  RepoAnalysisResponse,
  RepoCreatedInYear,
  RepoInteractionsInYear,
  ResponseData,
} from '~/types'

function getAccessCacheKey(options?: DataAccessOptions): string {
  if (options?.includePrivate) {
    return options.authCacheKey ?? 'authorized:unknown'
  }

  return 'public'
}

function applyDataAccessParams(
  params: Record<string, string | number | string[]>,
  options?: DataAccessOptions,
): Record<string, string | number | string[]> {
  if (options?.includePrivate) {
    return {
      ...params,
      includePrivate: 'true',
    }
  }

  return params
}

/**
 * 获取用户贡献数据
 */
export async function fetchContributionData(
  username: GitHubUsername,
  years?: ContributionYear[],
  statistics = false,
  accessOptions?: DataAccessOptions,
): Promise<ContributionApiResponse> {
  const endpoint = `/api/contribution/${username}`

  try {
    const params: Record<string, string | string[]> = {}

    if (years && years.length > 0) {
      params.years = years.map(String)
    }

    if (statistics) {
      params.statistics = 'true'
    }

    const response = await apiClient.get<ResponseData>(endpoint, {
      params: applyDataAccessParams(params, accessOptions),
    })

    if (!response.data || !response.meta) {
      throw new Error('No data received from contribution API')
    }

    return {
      data: response.data,
      meta: response.meta,
    }
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(endpoint, error.status, error.errorType)
    }

    throw error
  }
}

/**
 * 获取用户在指定年份创建的仓库
 */
export async function fetchReposInYear(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
): Promise<RepoCreatedInYear> {
  const endpoint = '/api/repos'

  try {
    return await apiClient.get<RepoCreatedInYear>(endpoint, {
      params: applyDataAccessParams({ username, year }, accessOptions),
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(endpoint, error.status, error.errorType)
    }

    throw error
  }
}

/**
 * 获取用户在指定年份参与的问题
 */
export async function fetchIssuesInYear(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
): Promise<IssuesInYear> {
  const endpoint = '/api/issues'

  try {
    return await apiClient.get<IssuesInYear>(endpoint, {
      params: applyDataAccessParams({ username, year }, accessOptions),
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(endpoint, error.status, error.errorType)
    }

    throw error
  }
}

/**
 * 获取用户在指定年份与各仓库的交互统计
 */
export async function fetchRepoInteractionsInYear(
  username: GitHubUsername,
  year: ContributionYear,
  accessOptions?: DataAccessOptions,
): Promise<RepoInteractionsInYear> {
  const endpoint = '/api/repo-interactions'

  try {
    return await apiClient.get<RepoInteractionsInYear>(endpoint, {
      params: applyDataAccessParams({ username, year }, accessOptions),
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(endpoint, error.status, error.errorType)
    }

    throw error
  }
}

/**
 * 获取单个仓库的深度分析数据
 */
export async function fetchRepoAnalysis(
  owner: string,
  repo: string,
  metrics?: ('basic' | 'health' | 'techstack')[],
  accessOptions?: DataAccessOptions,
): Promise<RepoAnalysisResponse> {
  const endpoint = `/api/repo/${owner}/${repo}`

  try {
    const params: Record<string, string> = {}

    if (metrics && metrics.length > 0) {
      params.includeMetrics = metrics.join(',')
    }

    return await apiClient.get<RepoAnalysisResponse>(endpoint, {
      params: applyDataAccessParams(params, accessOptions),
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(endpoint, error.status, error.errorType)
    }

    throw error
  }
}

/**
 * 查询键工厂 - 用于生成一致的查询键
 */
export const queryKeys = {
  // 用户相关
  user: (username: GitHubUsername) => ['user', username] as const,

  // 贡献数据相关
  contribution: (
    username: GitHubUsername,
    years?: ContributionYear[],
    statistics?: boolean,
    accessOptions?: DataAccessOptions,
  ) =>
    [
      'contribution',
      username,
      ...(years ? [{ years }] : []),
      ...(statistics ? [{ statistics }] : []),
      { access: getAccessCacheKey(accessOptions) },
    ] as const,

  // 仓库相关
  repos: (
    username: GitHubUsername,
    year: ContributionYear,
    accessOptions?: DataAccessOptions,
  ) =>
    [
      'repos',
      username,
      year,
      { access: getAccessCacheKey(accessOptions) },
    ] as const,

  // 问题相关
  issues: (
    username: GitHubUsername,
    year: ContributionYear,
    accessOptions?: DataAccessOptions,
  ) =>
    [
      'issues',
      username,
      year,
      { access: getAccessCacheKey(accessOptions) },
    ] as const,

  // 仓库交互相关
  repoInteractions: (
    username: GitHubUsername,
    year: ContributionYear,
    accessOptions?: DataAccessOptions,
  ) =>
    [
      'repoInteractions',
      username,
      year,
      { access: getAccessCacheKey(accessOptions) },
    ] as const,

  // 单仓库深度分析相关
  repoAnalysis: (
    owner: string,
    repo: string,
    metrics?: string[],
    accessOptions?: DataAccessOptions,
  ) =>
    [
      'repoAnalysis',
      owner,
      repo,
      ...(metrics ? [{ metrics }] : []),
      { access: getAccessCacheKey(accessOptions) },
    ] as const,

  // 用户所有数据（用于组合查询）
  userData: (username: GitHubUsername, year?: ContributionYear) =>
    ['userData', username, ...(year ? [year] : [])] as const,
} as const
