import { type NextRequest, NextResponse } from 'next/server'

import { getGitHubAccessToken } from '~/server/auth/get-github-access-token'
import { fetchIssuesInYear } from '~/services'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl

  const username = searchParams.get('username')
  const year = searchParams.get('year')

  if (username && year) {
    const tokenResult = await getGitHubAccessToken(request, username)
    const { token } = tokenResult

    const issues = await fetchIssuesInYear(
      { username, year: Number(year) },
      { token },
    )

    const response = NextResponse.json(issues)

    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie')

    return response
  }

  return NextResponse.json({ error: 'Missing username or year' }, { status: 400 })
}
