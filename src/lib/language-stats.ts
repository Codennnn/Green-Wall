import type { RepoInfo } from '~/types'

export interface TopLanguageItem {
  language: string
  bytes: number
  ratio: number
}

export interface GetTopLanguagesOptions {
  limit?: number
  includeUnknown?: boolean
  unknownLabel?: string
}

export function getTopLanguagesFromRepos(
  repos: RepoInfo[] | undefined,
  options: GetTopLanguagesOptions = {},
): TopLanguageItem[] {
  const {
    limit = 5,
    includeUnknown = false,
    unknownLabel = 'Unknown',
  } = options

  const languageBytes = new Map<string, number>()
  let totalBytes = 0

  if (Array.isArray(repos)) {
    repos.forEach((repo) => {
      const edges = repo.languages?.edges

      if (Array.isArray(edges) && edges.length > 0) {
        edges.forEach((edge) => {
          const languageName = edge.node.name
          const size = edge.size

          if (languageName) {
            const existing = languageBytes.get(languageName) ?? 0
            languageBytes.set(languageName, existing + size)
            totalBytes += size
          }
        })
      }
      else {
        if (includeUnknown) {
          const existing = languageBytes.get(unknownLabel) ?? 0
          languageBytes.set(unknownLabel, existing)
        }
      }
    })
  }

  const items: TopLanguageItem[] = []

  languageBytes.forEach((bytes, language) => {
    const ratio = totalBytes > 0 ? (bytes / totalBytes) : 0
    items.push({ language, bytes, ratio })
  })

  items.sort((a, b) => {
    if (b.bytes !== a.bytes) {
      return b.bytes - a.bytes
    }

    return a.language.localeCompare(b.language)
  })

  return items.slice(0, Math.max(0, limit))
}
