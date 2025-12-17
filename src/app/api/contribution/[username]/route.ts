import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import { getValuableStatistics } from '~/helpers'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'
import type { GraphData, ResponseData, ValuableStatistics } from '~/types'

interface GetContributionRequestParams {
  username: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<GetContributionRequestParams> },
) {
  const { username } = await params
  const statistics = request.nextUrl.searchParams.get('statistics') === 'true'
  const { searchParams } = new URL(request.url)
  const queryYears = searchParams.getAll('years').map(Number)

  try {
    const githubUser = await fetchGitHubUser(username)

    const contributionYears = githubUser.contributionYears

    const filteredYears
      = Array.isArray(queryYears) && queryYears.length > 0
        ? contributionYears.filter((year) => queryYears.includes(year))
        : contributionYears

    const contributionCalendars = await Promise.all(
      filteredYears.map((year) => fetchContributionsCollection(username, year)),
    )

    const graphData: GraphData = {
      ...githubUser,
      contributionYears: filteredYears,
      contributionCalendars,
    }

    let valuableStatistics: ValuableStatistics | undefined

    if (statistics) {
      valuableStatistics = getValuableStatistics(graphData)
    }

    const data = valuableStatistics ? { ...graphData, statistics: valuableStatistics } : graphData

    return NextResponse.json({ data }, { status: 200 })
  }
  catch (err) {
    if (err instanceof Error) {
      const errorData: ResponseData = { errorType: ErrorType.BadRequest, message: err.message }

      if (err.message === 'Bad credentials') {
        return NextResponse.json(
          { ...errorData, errorType: ErrorType.BadCredentials },
          { status: 401 },
        )
      }

      return NextResponse.json(errorData, { status: 400 })
    }
  }
}
