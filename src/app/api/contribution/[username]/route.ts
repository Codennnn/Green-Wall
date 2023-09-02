import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'
import type { GraphData, ResponseData } from '~/types'

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
    } catch (err) {
      if (err instanceof Error) {
        const errorData: ResponseData = { errorType: ErrorType.BadRequest, message: err.message }

        if (err.message === 'Bad credentials') {
          return NextResponse.json(
            { ...errorData, errorType: ErrorType.BadCredentials },
            { status: 401 }
          )
        }

        return NextResponse.json(errorData, { status: 400 })
      }
    }
  }
}
