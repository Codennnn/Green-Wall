const GQL_API_URL = 'https://api.github.com/graphql'

export interface GraphQLRequestParams<V = Record<string, unknown>> {
  /** GraphQL 查询语句 */
  query: string
  /** 查询变量 */
  variables?: V
  /** GitHub access token（可选，不传则使用环境变量） */
  token?: string
}

export interface GitHubGraphQLResponse<T> {
  data?: T
  message?: string
  errors?: { type: string, message: string }[]
}

export class GitHubGraphQLError extends Error {
  constructor(
    message: string,
    public readonly type?: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'GitHubGraphQLError'
  }
}

/**
 * 执行 GitHub GraphQL 查询
 *
 * @param params - 请求参数
 * @returns GraphQL 响应数据
 * @throws GitHubGraphQLError - 当请求失败或返回错误时
 */
export async function githubGraphql<T>(
  params: GraphQLRequestParams,
): Promise<T> {
  const { query, variables, token } = params

  const accessToken = token ?? process.env.GITHUB_ACCESS_TOKEN

  if (!accessToken) {
    throw new GitHubGraphQLError('GitHub access token is required')
  }

  const response = await fetch(GQL_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  if (!response.ok) {
    throw new GitHubGraphQLError(
      `GitHub API error: ${response.statusText}`,
      'HTTP_ERROR',
      response.status,
    )
  }

  const json = await response.json() as GitHubGraphQLResponse<T>

  if (json.errors && json.errors.length > 0) {
    const firstError = json.errors[0]
    throw new GitHubGraphQLError(
      firstError.message,
      firstError.type,
    )
  }

  // 处理 API 级别错误（如 Bad credentials）
  if (json.message) {
    throw new GitHubGraphQLError(json.message)
  }

  if (!json.data) {
    throw new GitHubGraphQLError('No data returned from GitHub API')
  }

  return json.data
}
