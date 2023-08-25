import { type NextRequest, NextResponse } from 'next/server'

import {
  type ContributionBasic,
  type ContributionCalendar,
  type ContributionYear,
  ErrorType,
  type GitHubApiJson,
  type GitHubContributionCalendar,
  type GitHubUser,
  type GraphData,
  type ResponseData,
} from '~/types'

const GAT = process.env.GITHUB_ACCESS_TOKEN

async function fetchGitHubUser(username: string): Promise<ContributionBasic> {
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

async function fetchContributionsCollection(
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

export async function GET(_: NextRequest, { params }: { params: { username: string } }) {
  const { username } = params

  if (typeof username === 'string') {
    try {
      const githubUser = await fetchGitHubUser(username)

      const contributionCalendars = await Promise.all(
        githubUser.contributionYears.map((year) => fetchContributionsCollection(username, year))
      )

      const data: GraphData = { ...githubUser, contributionCalendars }

      return NextResponse.json({ data }, { status: 200 })
    } catch (e: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const errorData: ResponseData = { errorType: ErrorType.BadRequest, message: e.message }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (e.message === 'Bad credentials') {
        return NextResponse.json(
          { ...errorData, errorType: ErrorType.BadCredentials },
          { status: 401 }
        )
      }
      return NextResponse.json(errorData, { status: 400 })
    }
  }
}
