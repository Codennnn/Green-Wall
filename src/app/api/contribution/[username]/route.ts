import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import { getValuableStatistics } from '~/helpers'
import { getGitHubAccessToken } from '~/server/auth/get-github-access-token'
import { fetchContributionsCollection, fetchGitHubUser } from '~/services'
import type { GraphData, ResponseData, ResponseMeta, ValuableStatistics } from '~/types'

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

  try {
    // 获取 token 和模式信息
    const tokenResult = await getGitHubAccessToken(request, username)
    const { token, mode, viewerLogin, fallbackReason } = tokenResult

    const serviceOptions = { token }

    const githubUser = await fetchGitHubUser(username, serviceOptions)

    const contributionYears = githubUser.contributionYears

    const filteredYears
      = Array.isArray(queryYears) && queryYears.length > 0
        ? contributionYears.filter((year) => queryYears.includes(year))
        : contributionYears

    const contributionCalendars = await Promise.all(
      filteredYears.map((year) => fetchContributionsCollection(username, year, serviceOptions)),
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

    // 构建响应元数据
    const meta: ResponseMeta = {
      mode,
      ...(viewerLogin && { viewer: { login: viewerLogin } }),
      ...(fallbackReason && { reason: fallbackReason }),
    }

    const response = NextResponse.json<ResponseData>({ data, meta }, { status: 200 })

    // 设置缓存控制头，避免私有数据被共享缓存
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie')

    return response
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
