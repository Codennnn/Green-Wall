import type {
  ContributionBasic,
  ContributionCalendar,
  ContributionYear,
  GitHubApiJson,
  GitHubContributionCalendar,
  GitHubRepo,
  GitHubUser,
  GitHubUsername,
  RepoCreatedInYear,
} from '~/types'

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

export async function getReposCreatedInYear(
  username: GitHubUsername,
  year: ContributionYear
): Promise<RepoCreatedInYear> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const query = `
    query($username: String!, $after: String) {
      user(login: $username) {
        repositories(first: 100, after: $after, isFork: false, orderBy: {field: CREATED_AT, direction: ASC}) {
          nodes {
            name
            createdAt
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

  const reposInYear = []

  while (hasNextPage) {
    const variables = {
      username,
      after: cursor,
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

    if (!repositories) {
      return { count: 0, repos: [] }
    }

    const filteredRepos = repositories.nodes.filter(
      (repo) => new Date(repo.createdAt).getFullYear() === year
    )

    reposInYear.push(...filteredRepos)

    repoCount += filteredRepos.length
    hasNextPage = repositories.pageInfo.hasNextPage
    cursor = repositories.pageInfo.endCursor
  }

  return { count: repoCount, repos: reposInYear }
}
