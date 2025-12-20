import { eventTracker } from '~/lib/analytics'
import { apiClient, ApiError } from '~/lib/api-client'
import type {
  ContributionYear,
  GitHubUsername,
  GraphData,
  IssuesInYear,
  RepoCreatedInYear,
  RepoInteractionsInYear,
  ResponseData,
} from '~/types'

/**
 * 获取用户贡献数据
 */
export async function fetchContributionData(
  username: GitHubUsername,
  years?: ContributionYear[],
  statistics = false,
): Promise<GraphData> {
  const endpoint = `/api/contribution/${username}`

  try {
    const params: Record<string, string | string[]> = {}

    if (years && years.length > 0) {
      params.years = years.map(String)
    }

    if (statistics) {
      params.statistics = 'true'
    }

    const response = await apiClient.get<ResponseData>(
      endpoint,
      {
        params,
      },
    )

    if (!response.data) {
      throw new Error('No data received from contribution API')
    }

    return response.data
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(
        endpoint,
        error.status,
        error.errorType,
      )
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
): Promise<RepoCreatedInYear> {
  const endpoint = '/api/repos'

  try {
    return await apiClient.get<RepoCreatedInYear>(endpoint, {
      params: { username, year },
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(
        endpoint,
        error.status,
        error.errorType,
      )
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
): Promise<IssuesInYear> {
  const endpoint = '/api/issues'

  try {
    return await apiClient.get<IssuesInYear>(endpoint, {
      params: { username, year },
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(
        endpoint,
        error.status,
        error.errorType,
      )
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
): Promise<RepoInteractionsInYear> {
  const endpoint = '/api/repo-interactions'

  try {
    return await apiClient.get<RepoInteractionsInYear>(endpoint, {
      params: { username, year },
    })
  }
  catch (error) {
    if (error instanceof ApiError) {
      eventTracker.api.error(
        endpoint,
        error.status,
        error.errorType,
      )
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
  ) =>
    [
      'contribution',
      username,
      ...(years ? [{ years }] : []),
      ...(statistics ? [{ statistics }] : []),
    ] as const,

  // 仓库相关
  repos: (username: GitHubUsername, year: ContributionYear) =>
    ['repos', username, year] as const,

  // 问题相关
  issues: (username: GitHubUsername, year: ContributionYear) =>
    ['issues', username, year] as const,

  // 仓库交互相关
  repoInteractions: (username: GitHubUsername, year: ContributionYear) =>
    ['repoInteractions', username, year] as const,

  // 用户所有数据（用于组合查询）
  userData: (username: GitHubUsername, year?: ContributionYear) =>
    ['userData', username, ...(year ? [year] : [])] as const,
} as const
