import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  ContributionCalendar,
  ContributionYear,
  GitHubContributionsCollection,
  GitHubUser,
  RequestResult,
} from '../../../types'

async function fetchGitHubUser(username: string): Promise<GitHubUser> {
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
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
  })

  type Json = {
    data: { user: GitHubUser | null }
    errors?: any[]
  }
  const json: Json = await res.json()

  if (!json.data.user) {
    throw new Error()
  }

  return json.data.user
}

async function fetchContributionsCollection(
  username: string,
  year: ContributionYear
): Promise<ContributionCalendar> {
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
      Authorization: `Bearer ${process.env.GITHUB_ACCESS_TOKEN}`,
      'content-type': 'application/json',
    },
  })

  type Json = {
    data: { user: GitHubContributionsCollection | null }
    errors?: any[]
  }
  const json: Json = await res.json()

  if (!json.data.user) {
    throw new Error()
  }

  const contributionCalendar = json.data.user.contributionsCollection.contributionCalendar

  return { ...contributionCalendar, year }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query

  if (typeof username === 'string') {
    const githubUser = await fetchGitHubUser(username)

    const years = githubUser.contributionsCollection.years
    const contributionCalendars = await Promise.all(
      years.map((year) => fetchContributionsCollection(username, year))
    )

    const data: RequestResult = { ...githubUser, contributionCalendars }

    return res.status(200).json(data)
  }
}
