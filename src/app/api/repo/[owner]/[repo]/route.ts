import { type NextRequest, NextResponse } from 'next/server'

import { getGitHubAccessToken } from '~/server/auth/get-github-access-token'
import { fetchRepoAnalysis } from '~/services'

export const dynamic = 'force-dynamic'

/**
 * 获取单个仓库的深度分析数据
 *
 * @param request - Next.js 请求对象
 * @param params - 路由参数 { owner, repo }
 * @returns 仓库分析数据
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string, repo: string }> },
) {
  const { owner, repo } = await params
  const { searchParams } = request.nextUrl

  const includeMetrics = searchParams.get('includeMetrics') ?? 'basic,health'
  const metrics = includeMetrics.split(',') as ('basic' | 'health' | 'techstack')[]

  if (!owner || !repo) {
    return NextResponse.json(
      { error: 'Missing owner or repo' },
      { status: 400 },
    )
  }

  try {
    const tokenResult = await getGitHubAccessToken(request, owner)
    const { token, mode } = tokenResult

    const data = await fetchRepoAnalysis(
      { owner, repo, metrics },
      { token },
    )

    const response = NextResponse.json({
      data,
      meta: {
        mode,
        fetchedAt: new Date().toISOString(),
        metrics,
      },
    })

    // 设置缓存策略：私有缓存，不存储
    response.headers.set('Cache-Control', 'private, no-store')
    response.headers.set('Vary', 'Cookie')

    return response
  }
  catch (error) {
    console.error('Failed to fetch repository analysis:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: 'Failed to fetch repository analysis', message: errorMessage },
      { status: 500 },
    )
  }
}
