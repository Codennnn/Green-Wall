import type { NextApiRequest, NextApiResponse } from 'next'

import type {
  ContributionBasic,
  ContributionCalendar,
  ContributionYear,
  GitHubApiJson,
  GitHubContributionCalendar,
  GitHubUser,
  GraphData,
} from '../../../types'

async function fetchGitHubUser(username: string): Promise<ContributionBasic | never> {
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

  const json: GitHubApiJson<{ user: GitHubContributionCalendar | null }> = await res.json()

  if (!json.data?.user) {
    throw new Error(json.message)
  }

  const contributionCalendar = json.data.user.contributionsCollection.contributionCalendar

  return { ...contributionCalendar, year }
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query

  if (typeof username === 'string') {
    try {
      const githubUser = await fetchGitHubUser(username)

      const contributionCalendars = await Promise.all(
        githubUser.contributionYears.map((year) => fetchContributionsCollection(username, year))
      )

      const data: GraphData = { ...githubUser, contributionCalendars }

      return res.status(200).json(data)
    } catch (e: any) {
      return res.status(400).json({ message: e.message })
    }
  }
}
