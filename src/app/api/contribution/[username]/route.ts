import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import { getValuableStatistics } from '~/helpers'
import { mockGraphData } from '~/mock-data'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'
import type { GraphData, ResponseData } from '~/types'

interface GetContributionRequestParams {
  username: string
  statistics?: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: GetContributionRequestParams }
) {
  const { username, statistics = false } = params

  if (typeof username === 'string') {
    const { searchParams } = new URL(request.url)

    const queryYears = searchParams.getAll('years').map(Number)

    if (process.env.NEXT_PUBLIC_DATA_MODE === 'mock') {
      return NextResponse.json({ data: mockGraphData }, { status: 200 })
    }

    try {
      const githubUser = await fetchGitHubUser(username)

      const contributionYears = githubUser.contributionYears

      const filteredYears =
        Array.isArray(queryYears) && queryYears.length > 0
          ? contributionYears.filter((year) => queryYears.includes(year))
          : contributionYears

      const contributionCalendars = await Promise.all(
        filteredYears.map((year) => fetchContributionsCollection(username, year))
      )

      const graphData: GraphData = {
        ...githubUser,
        contributionYears: filteredYears,
        contributionCalendars,
      }

      const valuableStatistics = getValuableStatistics(graphData)

      const data = statistics ? { ...graphData, statistics: valuableStatistics } : graphData

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
