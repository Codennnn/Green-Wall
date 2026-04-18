import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import { getValuableStatistics } from '~/helpers'
import {
  isGitHubTokenError,
  runWithGitHubAccessToken,
  tokenResultToMeta,
} from '~/server/auth/get-github-access-token'
import {
  isValidContributionYear,
  isValidGitHubUsername,
} from '~/server/github/validation'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'
import type { GraphData, ResponseData, ValuableStatistics } from '~/types'

/**
 * 强制动态渲染，避免私有数据被缓存
 */
export const dynamic = 'force-dynamic'

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
  const includePrivate = searchParams.get('includePrivate') === 'true'

  if (!isValidGitHubUsername(username)) {
    return NextResponse.json<ResponseData>(
      { errorType: ErrorType.BadRequest, message: 'Invalid GitHub username' },
      { status: 400 },
    )
  }

  if (queryYears.some((year) => !isValidContributionYear(year))) {
    return NextResponse.json<ResponseData>(
      { errorType: ErrorType.BadRequest, message: 'Invalid contribution year' },
      { status: 400 },
    )
  }

  try {
    const result = await runWithGitHubAccessToken(
      request,
      username,
      { includePrivate, requiredScopes: ['repo'] },
      async ({ token }) => {
        const serviceOptions = { token }

        const githubUser = await fetchGitHubUser(username, serviceOptions)

        const contributionYears = githubUser.contributionYears

        const filteredYears
          = Array.isArray(queryYears) && queryYears.length > 0
            ? contributionYears.filter((year) => queryYears.includes(year))
            : contributionYears

        const contributionCalendars = await Promise.all(
          filteredYears.map((year) =>
            fetchContributionsCollection(username, year, serviceOptions),
          ),
        )

        const graphData: GraphData = {
          ...githubUser,
          contributionYears,
          contributionCalendars,
        }

        let valuableStatistics: ValuableStatistics | undefined

        if (statistics) {
          valuableStatistics = getValuableStatistics(graphData)
        }

        return valuableStatistics
          ? { ...graphData, statistics: valuableStatistics }
          : graphData
      },
    )
    const { data, tokenResult } = result
    const meta = tokenResultToMeta(tokenResult)

    const response = NextResponse.json<ResponseData>(
      { data, meta },
      { status: 200 },
    )

    // 设置缓存控制头，避免私有数据被共享缓存
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie')

    return response
  }
  catch (err) {
    if (err instanceof Error) {
      const errorData: ResponseData = {
        errorType: ErrorType.BadRequest,
        message: err.message,
      }

      if (isGitHubTokenError(err)) {
        return NextResponse.json(
          { ...errorData, errorType: ErrorType.BadCredentials },
          { status: 401 },
        )
      }

      return NextResponse.json(errorData, { status: 400 })
    }

    return NextResponse.json<ResponseData>(
      {
        errorType: ErrorType.BadRequest,
        message: 'Failed to fetch contribution data',
      },
      { status: 400 },
    )
  }
}
