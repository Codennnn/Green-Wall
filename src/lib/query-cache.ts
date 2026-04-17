import type { QueryClient } from '@tanstack/react-query'

const GITHUB_DATA_QUERY_ROOTS = [
  'contribution',
  'repos',
  'issues',
  'repoInteractions',
  'repoAnalysis',
] as const

export function clearGitHubDataQueries(queryClient: QueryClient) {
  for (const queryKey of GITHUB_DATA_QUERY_ROOTS) {
    queryClient.removeQueries({ queryKey: [queryKey] })
  }
}
