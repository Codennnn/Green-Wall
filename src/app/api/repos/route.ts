import { type NextRequest, NextResponse } from 'next/server'

import { getGitHubAccessToken } from '~/server/auth/get-github-access-token'
import { fetchReposCreatedInYear } from '~/services'

/**
 * 强制动态渲染，避免私有数据被缓存
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const username = searchParams.get('username')
  const year = searchParams.get('year')

  if (username && year) {
    const tokenResult = await getGitHubAccessToken(request, username)
    const { token, mode } = tokenResult

    // 授权模式下包含私有仓库
    const includePrivate = mode === 'authorized'

    const repos = await fetchReposCreatedInYear(
      { username, year: Number(year), includePrivate },
      { token },
    )

    const response = NextResponse.json(repos)

    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie')

    return response
  }

  return NextResponse.json({ error: 'Missing username or year' }, { status: 400 })
}
