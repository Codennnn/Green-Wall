import { getCurrentYear } from '~/helpers'
import type {
  ContributionBasic,
  ContributionCalendar,
  ContributionYear,
  GitHubApiJson,
  GitHubContributionCalendar,
  GitHubIssue,
  GitHubRepo,
  GitHubUser,
  GitHubUsername,
  IssueInfo,
  IssuesInYear,
  RepoCreatedInYear,
  RepoInfo,
} from '~/types'

/**
 * The direction of the query.
 */
const enum Direction {
  /** Data will be sorted from new to old. */
  DESC = 'DESC',
  /** Data will be sorted from old to new. */
  ASC = 'ASC',
}

const GQL_API_URL = 'https://api.github.com/graphql'

function getDefaultDirectionForYear(
  targetYear: ContributionYear,
  now?: Date,
): Direction {
  if (now) {
    const yearOfNow = now.getFullYear()

    if (yearOfNow - targetYear <= 4) {
      return Direction.DESC
    }

    return Direction.ASC
  }

  const currentYear = getCurrentYear()

  if (currentYear - targetYear <= 4) {
    return Direction.DESC
  }

  return Direction.ASC
}

export interface ServiceOptions {
  /** 可选的 GitHub access token，不传则使用环境变量 GITHUB_ACCESS_TOKEN */
  token?: string
}

function getAccessToken(options?: ServiceOptions): string {
  const token = options?.token ?? process.env.GITHUB_ACCESS_TOKEN

  if (!token) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  return token
}

export async function fetchGitHubUser(
  username: GitHubUsername,
  options?: ServiceOptions,
): Promise<ContributionBasic> {
  const token = getAccessToken(options)

  const query = `
    {
      user(login: "${username}") {
        name
        login
        avatarUrl
        bio
        contributionsCollection {
          years: contributionYears
        }
        followers {
          totalCount
        }
        following {
          totalCount
        }
      }
    }
  `

  const res = await fetch(GQL_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      query,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson = await res.json() as GitHubApiJson<{ user: GitHubUser | null }>

  if (!resJson.data?.user) {
    if (resJson.errors) {
      const error = resJson.errors.at(0)

      if (error) {
        throw new Error(error.message)
      }
    }

    throw new Error(resJson.message)
  }

  const { contributionsCollection, ...rest } = resJson.data.user

  return { contributionYears: contributionsCollection.years, ...rest }
}

export async function fetchContributionsCollection(
  username: GitHubUsername,
  year: ContributionYear,
  options?: ServiceOptions,
): Promise<ContributionCalendar> {
  const token = getAccessToken(options)

  const query = `
        {
          user(login: "${username}") {
            contributionsCollection(from: "${new Date(
              `${year}-01-01`,
            ).toISOString()}", to: "${new Date(`${year}-12-31`).toISOString()}") {
              contributionCalendar {
                total: totalContributions
                weeks {
                  days: contributionDays {
                    count: contributionCount
                    level: contributionLevel
                    date
                    weekday
                  }
                }
              }
            }
          }
        }
      `

  const res = await fetch(GQL_API_URL, {
    method: 'POST',
    body: JSON.stringify({
      query,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson = await res.json() as GitHubApiJson<{ user: GitHubContributionCalendar | null }>

  if (!resJson.data?.user) {
    throw new Error(resJson.message)
  }

  const contributionCalendar = resJson.data.user.contributionsCollection.contributionCalendar

  return { ...contributionCalendar, year }
}

interface FetchReposCreatedInYearParams {
  username: GitHubUsername
  year: ContributionYear
  pageSize?: number
  /** 是否包含私有仓库（授权模式时启用） */
  includePrivate?: boolean
  /**
   * 可选的“当前时间”基准，用于推导默认排序方向。
   * 不传时使用系统当前年份。
   */
  now?: Date
  /**
   * 可选的排序方向。传入时将覆盖默认的基于年份差的排序逻辑。
   */
  direction?: Direction
}

/**
 * Get the list of repositories created by the specified user in the specified year.
 */
export async function fetchReposCreatedInYear(
  params: FetchReposCreatedInYearParams,
  options?: ServiceOptions,
): Promise<RepoCreatedInYear> {
  const {
    username,
    year,
    pageSize = 15,
    includePrivate = false,
    now,
    direction: directionOverride,
  } = params
  const token = getAccessToken(options)

  // 根据是否包含私有仓库决定 privacy 过滤
  const privacyFilter = includePrivate ? '' : 'privacy: PUBLIC,'

  const query = `
    query($username: String!, $cursor: String, $pageSize: Int!, $direction: OrderDirection!) {
      user(login: $username) {
        repositories(
          first: $pageSize,
          after: $cursor,
          isFork: false,
          ${privacyFilter}
          orderBy: {field: CREATED_AT, direction: $direction}
        ) {
          nodes {
            name
            createdAt
            url
            description
            stargazerCount
            forkCount
            issues(states: [OPEN, CLOSED]) {
              totalCount
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history {
                    totalCount
                  }
                }
              }
            }
            languages(first: 100, orderBy: { field: SIZE, direction: DESC }) {
              totalSize
              edges {
                size
                node {
                  name
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  let hasNextPage = true
  let cursor = null

  const effectiveDirection
    = directionOverride ?? getDefaultDirectionForYear(year, now)

  const reposInYear: RepoInfo[] = []

  while (hasNextPage) {
    const variables = {
      username,
      pageSize,
      direction: effectiveDirection,
      cursor,
    }

    const res = await fetch(GQL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    const resJson = await res.json() as GitHubApiJson<{ user: GitHubRepo }>

    if (resJson.errors) {
      throw new Error(resJson.message)
    }

    const repositories = resJson.data?.user.repositories
    const repoNodes = repositories?.nodes

    if (!repositories || !Array.isArray(repoNodes)) {
      break
    }

    const filteredRepos = repoNodes.filter(
      (repo) => new Date(repo.createdAt).getFullYear() === year,
    )
    const filteredReposCount = filteredRepos.length

    if (filteredReposCount > 0) {
      reposInYear.push(...filteredRepos)

      if (repoNodes.length !== filteredReposCount) {
        // Once the data exceeds the target year, it can stop fetching because the remaining data will be updated and no longer need to continue paging.
        break
      }
    }
    else {
      const lastRepo = repoNodes.at(-1)

      if (lastRepo) {
        const lastRepoYear = new Date(lastRepo.createdAt).getFullYear()

        if (effectiveDirection === Direction.DESC && lastRepoYear < year) {
          break
        }

        if (effectiveDirection === Direction.ASC && lastRepoYear > year) {
          break
        }
      }
    }

    hasNextPage = repositories.pageInfo.hasNextPage
    cursor = repositories.pageInfo.endCursor
  }

  return { count: reposInYear.length, repos: reposInYear }
}

interface FetchIssuesInYearParams {
  username: GitHubUsername
  year: ContributionYear
  pageSize?: number
  /**
   * 可选的“当前时间”基准，用于推导默认排序方向。
   * 不传时使用系统当前年份。
   */
  now?: Date
  /**
   * 可选的排序方向。传入时将覆盖默认的基于年份差的排序逻辑。
   */
  direction?: Direction
}

/**
 * Get the list of issues participated in by the specified user in the specified year.
 */
export async function fetchIssuesInYear(
  params: FetchIssuesInYearParams,
  options?: ServiceOptions,
): Promise<IssuesInYear> {
  const {
    username,
    year,
    pageSize = 50,
    now,
    direction: directionOverride,
  } = params
  const token = getAccessToken(options)

  const effectiveDirection
    = directionOverride ?? getDefaultDirectionForYear(year, now)

  const query = `
    query($pageSize: Int!, $cursor: String) {
      search(
        query: "involves:${username} is:issue sort:created-${effectiveDirection.toLowerCase()}"
        type: ISSUE
        first: $pageSize
        after: $cursor
      ) {
        nodes {
          ... on Issue {
            title
            createdAt
            url
            repository {
              nameWithOwner
              url
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `

  let hasNextPage = true
  let cursor = null

  const issuesInYear: IssueInfo[] = []

  while (hasNextPage) {
    const variables = {
      pageSize,
      direction: effectiveDirection,
      cursor,
    }

    const res = await fetch(GQL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    const resJson = await res.json() as GitHubApiJson<{ search: GitHubIssue }>

    if (resJson.errors) {
      throw new Error(resJson.message)
    }

    const issues = resJson.data?.search
    const issueNodes = issues?.nodes

    if (!issues || !Array.isArray(issueNodes)) {
      return { count: 0, issues: [] }
    }

    const filteredIssues = issueNodes.filter(
      (issue) => new Date(issue.createdAt).getFullYear() === year,
    )
    const filteredIssuesCount = filteredIssues.length

    if (filteredIssuesCount > 0) {
      issuesInYear.push(...filteredIssues)

      if (issueNodes.length !== filteredIssuesCount) {
        // Once the data exceeds the target year, it can stop fetching because the remaining data will be updated and no longer need to continue paging.
        break
      }
    }
    else {
      const lastIssue = issueNodes.at(-1)

      if (lastIssue) {
        const lastIssueYear = new Date(lastIssue.createdAt).getFullYear()

        if (effectiveDirection === Direction.DESC && lastIssueYear < year) {
          break
        }

        if (effectiveDirection === Direction.ASC && lastIssueYear > year) {
          break
        }
      }
    }

    hasNextPage = issues.pageInfo.hasNextPage
    cursor = issues.pageInfo.endCursor
  }

  return { count: issuesInYear.length, issues: issuesInYear }
}
