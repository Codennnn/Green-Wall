import type {
  ContributionBasic,
  ContributionCalendar,
  ContributionYear,
  GitHubApiJson,
  GitHubContributionCalendar,
  GitHubUser,
} from '~/types'

const GAT = process.env.GITHUB_ACCESS_TOKEN

export async function fetchGitHubUser(username: string): Promise<ContributionBasic> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'post',
    body: JSON.stringify({
      query: `
        {
          user(login: "${username}") {
            name
            login
            avatarUrl
            contributionsCollection {
              years: contributionYears
            }
          }
        }
      `,
    }),
    headers: {
      Authorization: `Bearer ${GAT}`,
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const json: GitHubApiJson<{ user: GitHubUser | null }> = await res.json()

  if (!json.data?.user) {
    if (json.errors) {
      const error = json.errors.at(0)
      if (error) {
        throw new Error(error.message)
      }
    }
    throw new Error(json.message)
  }

  const { contributionsCollection, ...rest } = json.data.user

  return { contributionYears: contributionsCollection.years, ...rest }
}

export async function fetchContributionsCollection(
  username: string,
  year: ContributionYear
): Promise<ContributionCalendar> {
  if (!GAT) {
    throw new Error('Require GITHUB ACCESS TOKEN.')
  }

  const res = await fetch('https://api.github.com/graphql', {
    method: 'post',
    body: JSON.stringify({
      query: `
        {
          user(login: "${username}") {
            contributionsCollection(from: "${new Date(
              `${year}-01-01`
            ).toISOString()}", to: "${new Date(`${year}-12-31`).toISOString()}") {
              contributionCalendar {
                total: totalContributions
                weeks {
                  days: contributionDays {
                    level: contributionLevel
                    weekday
                  }
                }
              }
            }
          }
        }
      `,
    }),
    headers: {
      Authorization: `Bearer ${GAT}`,
      'content-type': 'application/json',
    },
  })

  if (!res.ok) {
    throw new Error(`fetch error: ${res.statusText}.`)
  }

  const json: GitHubApiJson<{ user: GitHubContributionCalendar | null }> = await res.json()

  if (!json.data?.user) {
    throw new Error(json.message)
  }

  const contributionCalendar = json.data.user.contributionsCollection.contributionCalendar

  return { ...contributionCalendar, year }
}
