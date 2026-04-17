import { type NextRequest, NextResponse } from 'next/server'

import { ErrorType } from '~/enums'
import {
  isGitHubTokenError,
  runWithGitHubAccessToken,
  tokenResultToMeta,
} from '~/server/auth/get-github-access-token'
import {
  isValidGitHubRepoName,
  isValidGitHubUsername,
} from '~/server/github/validation'
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
  const metrics = includeMetrics.split(',') as (
    | 'basic'
    | 'health'
    | 'techstack'
  )[]
  const includePrivate = searchParams.get('includePrivate') === 'true'

  if (!owner || !repo) {
    return NextResponse.json(
      { errorType: ErrorType.BadRequest, message: 'Missing owner or repo' },
      { status: 400 },
    )
  }

  if (!isValidGitHubUsername(owner) || !isValidGitHubRepoName(repo)) {
    return NextResponse.json(
      { errorType: ErrorType.BadRequest, message: 'Invalid owner or repo' },
      { status: 400 },
    )
  }

  try {
    const { data, tokenResult } = await runWithGitHubAccessToken(
      request,
      owner,
      { includePrivate, requiredScopes: ['repo'] },
      ({ token }) => fetchRepoAnalysis({ owner, repo, metrics }, { token }),
    )
    const meta = tokenResultToMeta(tokenResult)

    const response = NextResponse.json({
      data,
      meta: {
        ...meta,
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

    const errorMessage
      = error instanceof Error ? error.message : 'Unknown error'
    const status = isGitHubTokenError(error) ? 401 : 500

    return NextResponse.json(
      {
        errorType:
          status === 401 ? ErrorType.BadCredentials : ErrorType.BadRequest,
        error: 'Failed to fetch repository analysis',
        message: errorMessage,
      },
      { status },
    )
  }
}
