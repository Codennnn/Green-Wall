import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import {
  isGitHubTokenError,
  runWithGitHubAccessToken,
} from '~/server/auth/get-github-access-token'
import {
  isValidContributionYear,
  isValidGitHubUsername,
} from '~/server/github/validation'
import { fetchReposCreatedInYear } from '~/services'

/**
 * 强制动态渲染，避免私有数据被缓存
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const username = searchParams.get('username')
  const year = searchParams.get('year')
  const includePrivate = searchParams.get('includePrivate') === 'true'

  if (username && year) {
    const targetYear = Number(year)

    if (!isValidGitHubUsername(username)) {
      return NextResponse.json(
        { errorType: ErrorType.BadRequest, message: 'Invalid GitHub username' },
        { status: 400 },
      )
    }

    if (!isValidContributionYear(targetYear)) {
      return NextResponse.json(
        { errorType: ErrorType.BadRequest, message: 'Invalid contribution year' },
        { status: 400 },
      )
    }

    try {
      const { data: repos } = await runWithGitHubAccessToken(
        request,
        username,
        { includePrivate, requiredScopes: ['repo'] },
        ({ token, mode }) =>
          fetchReposCreatedInYear(
            {
              username,
              year: targetYear,
              includePrivate: mode === 'authorized',
            },
            { token },
          ),
      )

      const response = NextResponse.json(repos)

      response.headers.set('Cache-Control', 'private, no-store')
      response.headers.set('Vary', 'Cookie')

      return response
    }
    catch (error) {
      const message
        = error instanceof Error ? error.message : 'Failed to fetch repositories'
      const status = isGitHubTokenError(error) ? 401 : 400

      return NextResponse.json(
        {
          errorType:
            status === 401 ? ErrorType.BadCredentials : ErrorType.BadRequest,
          message,
        },
        { status },
      )
    }
  }

  return NextResponse.json(
    { errorType: ErrorType.BadRequest, message: 'Missing username or year' },
    { status: 400 },
  )
}
