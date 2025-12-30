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
  RepoAnalysis,
  RepoBasicMetrics,
  RepoCreatedInYear,
  RepoHealthMetrics,
  RepoInfo,
  RepoInteraction,
  RepoInteractionsInYear,
  RepoOwnerInfo,
  RepoTechStackMetrics,
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

/**
 * 影响力评分权重配置
 *
 * 评分模型：
 * - 社区影响力指标（主要）：star、fork
 * - 个人贡献指标（次要）：commits、pullRequests、reviews、issues
 */
const INFLUENCE_WEIGHTS = {
  /** Star 数量权重（社区影响力主要指标） */
  star: 50,
  /** Fork 数量权重（社区影响力次要指标） */
  fork: 25,
  /** Commit 数量权重（个人贡献指标） */
  commit: 8,
  /** Pull Request 数量权重（个人贡献指标） */
  pullRequest: 6,
  /** Review 数量权重（个人贡献指标） */
  review: 3,
  /** Issue 数量权重（个人贡献指标） */
  issue: 3,
} as const

/**
 * 计算单个仓库的影响力评分（log 压缩加权求和）
 *
 * 使用 log 压缩避免超高数值主导排序，让中小型有价值项目也有机会展示
 */
function computeInfluenceScore(repo: {
  stargazerCount: number
  forkCount: number
  interaction: {
    commits: number
    pullRequests: number
    reviews: number
    issues: number
  }
}): number {
  return (
    INFLUENCE_WEIGHTS.star * Math.log(1 + repo.stargazerCount)
    + INFLUENCE_WEIGHTS.fork * Math.log(1 + repo.forkCount)
    + INFLUENCE_WEIGHTS.commit * Math.log(1 + repo.interaction.commits)
    + INFLUENCE_WEIGHTS.pullRequest * Math.log(1 + repo.interaction.pullRequests)
    + INFLUENCE_WEIGHTS.review * Math.log(1 + repo.interaction.reviews)
    + INFLUENCE_WEIGHTS.issue * Math.log(1 + repo.interaction.issues)
  )
}

interface FetchRepoInteractionsInYearParams {
  username: GitHubUsername
  year: ContributionYear
}

/**
 * GitHub GraphQL contributionsCollection 按仓库聚合的响应结构
 */
interface ContributionsByRepository {
  repository: {
    nameWithOwner: string
    url: string
    description: string | null
    stargazerCount: number
    forkCount: number
  }
  contributions: {
    totalCount: number
  }
}

interface ContributionsCollectionResponse {
  user: {
    contributionsCollection: {
      commitContributionsByRepository: ContributionsByRepository[]
      pullRequestContributionsByRepository: ContributionsByRepository[]
      pullRequestReviewContributionsByRepository: ContributionsByRepository[]
      issueContributionsByRepository: ContributionsByRepository[]
    }
  } | null
}

/**
 * 获取用户在指定年份有交互活动的自有仓库列表
 *
 * 功能说明：
 * - 获取用户历年来创建的所有仓库中，在指定年份有过交互活动的仓库
 * - 只包含用户自己创建的仓库（通过 nameWithOwner 匹配用户名）
 * - 按影响力评分排序（基于 star、fork 和交互活动的综合评分）
 */
export async function fetchRepoInteractionsInYear(
  params: FetchRepoInteractionsInYearParams,
  options?: ServiceOptions,
): Promise<RepoInteractionsInYear> {
  const { username, year } = params
  const token = getAccessToken(options)

  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`

  const query = `
    query($username: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $username) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              url
              description
              stargazerCount
              forkCount
            }
            contributions {
              totalCount
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              url
              description
              stargazerCount
              forkCount
            }
            contributions {
              totalCount
            }
          }
          pullRequestReviewContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              url
              description
              stargazerCount
              forkCount
            }
            contributions {
              totalCount
            }
          }
          issueContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
              url
              description
              stargazerCount
              forkCount
            }
            contributions {
              totalCount
            }
          }
        }
      }
    }
  `

  const variables = { username, from, to }

  const res = await fetch(GQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson = await res.json() as GitHubApiJson<ContributionsCollectionResponse>

  if (resJson.errors) {
    const error = resJson.errors.at(0)

    if (error) {
      throw new Error(error.message)
    }

    throw new Error(resJson.message)
  }

  if (!resJson.data?.user) {
    throw new Error(resJson.message ?? 'User not found')
  }

  const collection = resJson.data.user.contributionsCollection

  // 按仓库 URL 聚合所有交互类型
  const repoMap = new Map<string, {
    nameWithOwner: string
    url: string
    description: string | null
    stargazerCount: number
    forkCount: number
    commits: number
    pullRequests: number
    reviews: number
    issues: number
  }>()

  // 辅助函数：合并贡献到 map
  const mergeContributions = (
    contributions: ContributionsByRepository[],
    field: 'commits' | 'pullRequests' | 'reviews' | 'issues',
  ) => {
    for (const item of contributions) {
      const { repository, contributions: contrib } = item
      const existing = repoMap.get(repository.url)

      if (existing) {
        existing[field] += contrib.totalCount
      }
      else {
        repoMap.set(repository.url, {
          nameWithOwner: repository.nameWithOwner,
          url: repository.url,
          description: repository.description,
          stargazerCount: repository.stargazerCount,
          forkCount: repository.forkCount,
          commits: field === 'commits' ? contrib.totalCount : 0,
          pullRequests: field === 'pullRequests' ? contrib.totalCount : 0,
          reviews: field === 'reviews' ? contrib.totalCount : 0,
          issues: field === 'issues' ? contrib.totalCount : 0,
        })
      }
    }
  }

  mergeContributions(collection.commitContributionsByRepository, 'commits')
  mergeContributions(collection.pullRequestContributionsByRepository, 'pullRequests')
  mergeContributions(collection.pullRequestReviewContributionsByRepository, 'reviews')
  mergeContributions(collection.issueContributionsByRepository, 'issues')

  // 转换为 RepoInteraction 数组并计算评分
  const repos: RepoInteraction[] = []

  for (const repo of repoMap.values()) {
    const interaction = {
      commits: repo.commits,
      pullRequests: repo.pullRequests,
      reviews: repo.reviews,
      issues: repo.issues,
    }

    repos.push({
      nameWithOwner: repo.nameWithOwner,
      url: repo.url,
      description: repo.description,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      interaction,
      score: computeInfluenceScore({
        stargazerCount: repo.stargazerCount,
        forkCount: repo.forkCount,
        interaction,
      }),
    })
  }

  // 只保留用户自己创建的仓库（在指定年份有交互活动的自有仓库）
  const filteredRepos = repos.filter((repo) => {
    const owner = repo.nameWithOwner.split('/')[0]

    return owner.toLowerCase() === username.toLowerCase()
  })

  filteredRepos.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score
    }

    const starsA = a.stargazerCount ?? 0
    const starsB = b.stargazerCount ?? 0

    if (starsB !== starsA) {
      return starsB - starsA
    }

    if (b.interaction.commits !== a.interaction.commits) {
      return b.interaction.commits - a.interaction.commits
    }

    return a.nameWithOwner.localeCompare(b.nameWithOwner)
  })

  return { count: filteredRepos.length, repos: filteredRepos }
}

interface FetchRepoAnalysisParams {
  owner: string
  repo: string
  /** 要获取的指标类别 */
  metrics?: ('basic' | 'health' | 'techstack')[]
}

/**
 * GitHub GraphQL API 返回的仓库数据结构
 */
interface GitHubRepositoryResponse {
  nameWithOwner: string
  url: string
  description: string | null
  stargazerCount: number
  forkCount: number
  pushedAt: string
  createdAt: string
  updatedAt: string
  isArchived: boolean
  isPrivate: boolean
  isFork: boolean
  isDisabled: boolean
  defaultBranchRef: {
    name: string
    target?: {
      history?: {
        totalCount: number
      }
    } | null
  } | null
  issues: {
    totalCount: number
  }
  openIssues?: {
    totalCount: number
  }
  closedIssues?: {
    totalCount: number
  }
  pullRequests?: {
    totalCount: number
  }
  openPullRequests?: {
    totalCount: number
  }
  mergedPullRequests?: {
    totalCount: number
  }
  closedPullRequests?: {
    totalCount: number
  }
  languages?: {
    totalSize: number
    edges: {
      size: number
      node: {
        name: string
      }
    }[]
  }
  licenseInfo?: {
    spdxId: string | null
    name: string | null
    url: string | null
  } | null
  releases?: {
    totalCount: number
  }
  latestRelease?: {
    tagName: string
    publishedAt: string
    url: string
  } | null
  repositoryTopics?: {
    nodes: {
      topic: {
        name: string
      }
    }[]
  }
  diskUsage?: number | null
  owner?: {
    login: string
    __typename: string
    avatarUrl: string
    url: string
  } & (
    | {
      __typename: 'User'
      name: string | null
      bio: string | null
      createdAt: string
      followers: {
        totalCount: number
      }
      following: {
        totalCount: number
      }
      repositories: {
        totalCount: number
      }
    }
    | {
      __typename: 'Organization'
      name: string | null
      description: string | null
      createdAt: string
      membersWithRole: {
        totalCount: number
      }
      repositories: {
        totalCount: number
      }
    }
  )
}

/**
 * 获取单个仓库的深度分析数据
 *
 * 功能说明：
 * - 按需获取仓库的核心指标、健康度指标和技术栈指标
 * - 通过 metrics 参数控制返回的数据类型
 * - 默认返回 basic 和 health 指标
 */
export async function fetchRepoAnalysis(
  params: FetchRepoAnalysisParams,
  options?: ServiceOptions,
): Promise<RepoAnalysis> {
  const { owner, repo, metrics = ['basic', 'health'] } = params
  const token = getAccessToken(options)

  const includeHealth = metrics.includes('health')
  const includeTechStack = metrics.includes('techstack')

  const query = `
    query {
      repository(owner: "${owner}", name: "${repo}") {
        nameWithOwner
        url
        description
        stargazerCount
        forkCount
        pushedAt
        createdAt
        updatedAt
        isArchived
        isPrivate
        isFork
        isDisabled

        defaultBranchRef {
          name
          target {
            ... on Commit {
              history {
                totalCount
              }
            }
          }
        }

        issues {
          totalCount
        }

        ${includeHealth
          ? `
          openIssues: issues(states: OPEN) {
            totalCount
          }
          closedIssues: issues(states: CLOSED) {
            totalCount
          }

          pullRequests {
            totalCount
          }
          openPullRequests: pullRequests(states: OPEN) {
            totalCount
          }
          mergedPullRequests: pullRequests(states: MERGED) {
            totalCount
          }
          closedPullRequests: pullRequests(states: CLOSED) {
            totalCount
          }
        `
          : ''}

        ${includeTechStack
          ? `
          languages(first: 100, orderBy: {field: SIZE, direction: DESC}) {
            totalSize
            edges {
              size
              node {
                name
              }
            }
          }

          licenseInfo {
            spdxId
            name
            url
          }

          releases {
            totalCount
          }
          latestRelease {
            tagName
            publishedAt
            url
          }

          repositoryTopics(first: 20) {
            nodes {
              topic {
                name
              }
            }
          }

          diskUsage
        `
          : ''}

        owner {
          login
          __typename
          avatarUrl
          url
          ... on User {
            name
            bio
            createdAt
            followers {
              totalCount
            }
            following {
              totalCount
            }
            repositories(privacy: PUBLIC) {
              totalCount
            }
          }
          ... on Organization {
            name
            description
            createdAt
            membersWithRole {
              totalCount
            }
            repositories(privacy: PUBLIC) {
              totalCount
            }
          }
        }
      }
    }
  `

  const res = await fetch(GQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson = await res.json() as GitHubApiJson<{ repository: GitHubRepositoryResponse | null }>

  if (resJson.errors) {
    const error = resJson.errors.at(0)

    if (error) {
      throw new Error(error.message)
    }

    throw new Error(resJson.message ?? 'Failed to fetch repository analysis')
  }

  const repository = resJson.data?.repository

  if (!repository) {
    throw new Error('Repository not found')
  }

  // 转换核心指标
  const basic: RepoBasicMetrics = {
    nameWithOwner: repository.nameWithOwner,
    url: repository.url,
    description: repository.description ?? null,
    stargazerCount: repository.stargazerCount,
    forkCount: repository.forkCount,
    commitCount: repository.defaultBranchRef?.target?.history?.totalCount ?? 0,
    issueCount: repository.issues.totalCount,
    pushedAt: repository.pushedAt,
    createdAt: repository.createdAt,
    updatedAt: repository.updatedAt,
    defaultBranchName: repository.defaultBranchRef?.name ?? null,
    status: {
      isArchived: repository.isArchived,
      isPrivate: repository.isPrivate,
      isFork: repository.isFork,
      isDisabled: repository.isDisabled,
    },
  }

  // 转换健康度指标
  let health: RepoHealthMetrics | null = null

  if (includeHealth) {
    const openIssues = repository.openIssues?.totalCount ?? 0
    const closedIssues = repository.closedIssues?.totalCount ?? 0
    const totalIssues = repository.issues.totalCount

    const openPRs = repository.openPullRequests?.totalCount ?? 0
    const mergedPRs = repository.mergedPullRequests?.totalCount ?? 0
    const closedPRs = repository.closedPullRequests?.totalCount ?? 0
    const totalPRs = repository.pullRequests?.totalCount ?? 0

    health = {
      issues: {
        total: totalIssues,
        open: openIssues,
        closed: closedIssues,
        openRatio: totalIssues > 0 ? openIssues / totalIssues : 0,
      },
      pullRequests: {
        total: totalPRs,
        open: openPRs,
        merged: mergedPRs,
        closed: closedPRs,
        mergedRatio: totalPRs > 0 ? mergedPRs / totalPRs : 0,
      },
    }
  }

  // 转换技术栈指标
  let techStack: RepoTechStackMetrics | null = null

  if (includeTechStack) {
    const languages = repository.languages?.edges ?? []
    const totalSize = repository.languages?.totalSize ?? 0

    techStack = {
      languages: {
        totalSize,
        items: languages.map((edge) => ({
          name: edge.node.name,
          size: edge.size,
          percentage: totalSize > 0 ? (edge.size / totalSize) * 100 : 0,
        })),
      },
      license: repository.licenseInfo
        ? {
            spdxId: repository.licenseInfo.spdxId,
            name: repository.licenseInfo.name,
            url: repository.licenseInfo.url,
          }
        : null,
      releases: {
        totalCount: repository.releases?.totalCount ?? 0,
        latest: repository.latestRelease
          ? {
              tagName: repository.latestRelease.tagName,
              publishedAt: repository.latestRelease.publishedAt,
              url: repository.latestRelease.url,
            }
          : null,
      },
      topics: repository.repositoryTopics?.nodes.map((node) => node.topic.name) ?? [],
      diskUsage: repository.diskUsage ?? null,
    }
  }

  // 转换 owner 信息
  let ownerInfo: RepoOwnerInfo | null = null

  if (repository.owner) {
    const ownerData = repository.owner
    const isUser = ownerData.__typename === 'User'

    ownerInfo = {
      login: ownerData.login,
      name: ownerData.name,
      avatarUrl: ownerData.avatarUrl,
      bio: isUser ? ownerData.bio : ownerData.description,
      url: ownerData.url,
      followers: isUser ? ownerData.followers.totalCount : ownerData.membersWithRole.totalCount,
      following: isUser ? ownerData.following.totalCount : 0,
      repositories: ownerData.repositories.totalCount,
      createdAt: ownerData.createdAt,
      type: isUser ? 'User' : 'Organization',
    }
  }

  return {
    basic,
    health,
    techStack,
    owner: ownerInfo,
  }
}
