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
  IssuesInYear,
  RepoCreatedInYear,
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

const GAT = process.env.GITHUB_ACCESS_TOKEN
const GQL_API_URL = 'https://api.github.com/graphql'

export async function fetchGitHubUser(username: GitHubUsername): Promise<ContributionBasic> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

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
      Authorization: `Bearer ${GAT}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson: GitHubApiJson<{ user: GitHubUser | null }> = await res.json()

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
  year: ContributionYear
): Promise<ContributionCalendar> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const query = `
        {
          user(login: "${username}") {
            contributionsCollection(from: "${new Date(
    `${year}-01-01`
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
      Authorization: `Bearer ${GAT}`,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const resJson: GitHubApiJson<{ user: GitHubContributionCalendar | null }> = await res.json()

  if (!resJson.data?.user) {
    throw new Error(resJson.message)
  }

  const contributionCalendar = resJson.data.user.contributionsCollection.contributionCalendar

  return { ...contributionCalendar, year }
}

interface GetReposCreatedInYearParams {
  username: GitHubUsername
  year: ContributionYear
  pageSize?: number
}

/**
 * Get the list of repositories created by the specified user in the specified year.
 */
export async function fetchReposCreatedInYear({
  username,
  year,
  pageSize = 15,
}: GetReposCreatedInYearParams): Promise<RepoCreatedInYear> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const query = `
    query($username: String!, $cursor: String, $pageSize: Int!, $direction: OrderDirection!) {
      user(login: $username) {
        repositories(
          first: $pageSize,
          after: $cursor,
          isFork: false,
          privacy: PUBLIC,
          orderBy: {field: CREATED_AT, direction: $direction}
        ) {
          nodes {
            name
            createdAt
            url
            description
            stargazerCount
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  let repoCount = 0
  let hasNextPage = true
  let cursor = null

  const currentYear = new Date().getFullYear()
  const direction = currentYear - year <= 4 ? Direction.DESC : Direction.ASC

  const reposInYear = []

  while (hasNextPage) {
    const variables = {
      username,
      pageSize,
      direction: Direction.DESC,
      cursor,
    }

    const res = await fetch(GQL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    const resJson: GitHubApiJson<{ user: GitHubRepo }> = await res.json()

    if (resJson.errors) {
      throw new Error(resJson.message)
    }

    const repositories = resJson.data?.user.repositories
    const repoNodes = repositories?.nodes

    if (!repositories || !Array.isArray(repoNodes)) {
      break
    }

    const filteredRepos = repoNodes.filter(
      (repo) => new Date(repo.createdAt).getFullYear() === year
    )
    const filteredReposCount = filteredRepos.length

    if (filteredReposCount > 0) {
      reposInYear.push(...filteredRepos)
      repoCount += filteredReposCount

      if (repoNodes.length !== filteredReposCount) {
        // Once the data exceeds the target year, it can stop fetching because the remaining data will be updated and no longer need to continue paging.
        break
      }
    } else {
      const lastRepo = repoNodes.at(-1)

      if (lastRepo) {
        const lastRepoYear = new Date(lastRepo.createdAt).getFullYear()

        if (direction === Direction.DESC && lastRepoYear < year) {
          break
        }

        if (direction === Direction.ASC && lastRepoYear > year) {
          break
        }
      }
    }

    hasNextPage = repositories.pageInfo.hasNextPage
    cursor = repositories.pageInfo.endCursor
  }

  return { count: repoCount, repos: reposInYear }
}

interface GetIssuesInYearParams {
  username: GitHubUsername
  year: ContributionYear
  pageSize?: number
}

/**
 * Get the list of issues participated in by the specified user in the specified year.
 */
export async function fetchIssuesInYear({
  username,
  year,
  pageSize = 50,
}: GetIssuesInYearParams): Promise<IssuesInYear> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const currentYear = new Date().getFullYear()
  const direction = currentYear - year <= 4 ? Direction.DESC : Direction.ASC

  const query = `
    query($pageSize: Int!, $cursor: String) {
      search(
        query: "involves:${username} is:issue sort:created-${direction.toLowerCase()}"
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

  let issueCount = 0
  let hasNextPage = true
  let cursor = null

  const issuesInYear = []

  while (hasNextPage) {
    const variables = {
      pageSize,
      direction,
      cursor,
    }

    const res = await fetch(GQL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GAT}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })

    const resJson: GitHubApiJson<{ search: GitHubIssue }> = await res.json()

    if (resJson.errors) {
      throw new Error(resJson.message)
    }

    const issues = resJson.data?.search
    const issueNodes = issues?.nodes

    if (!issues || !Array.isArray(issueNodes)) {
      return { count: 0, issues: [] }
    }

    const filteredIssues = issueNodes.filter(
      (issue) => new Date(issue.createdAt).getFullYear() === year
    )
    const filteredIssuesCount = filteredIssues.length

    if (filteredIssuesCount > 0) {
      issuesInYear.push(...filteredIssues)
      issueCount += filteredIssuesCount

      if (issueNodes.length !== filteredIssuesCount) {
        // Once the data exceeds the target year, it can stop fetching because the remaining data will be updated and no longer need to continue paging.
        break
      }
    } else {
      const lastIssue = issueNodes.at(-1)

      if (lastIssue) {
        const lastIssueYear = new Date(lastIssue.createdAt).getFullYear()

        if (direction === Direction.DESC && lastIssueYear < year) {
          break
        }

        if (direction === Direction.ASC && lastIssueYear > year) {
          break
        }
      }
    }

    hasNextPage = issues.pageInfo.hasNextPage
    cursor = issues.pageInfo.endCursor
  }

  return { count: issueCount, issues: issuesInYear }
}
