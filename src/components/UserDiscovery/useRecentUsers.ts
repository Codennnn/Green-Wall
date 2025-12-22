import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { StorageKeys } from '~/constants'
import type { GitHubUser } from '~/types'

export interface RecentGitHubUser {
  login: GitHubUser['login']
  avatarUrl: GitHubUser['avatarUrl']
  lastSearchedAt: number
}

const RECENT_USERS_LIMIT = 8

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isRecentGitHubUser(value: unknown): value is RecentGitHubUser {
  let ok = false

  if (value && typeof value === 'object') {
    const maybe = value as Record<string, unknown>
    ok = isNonEmptyString(maybe.login)
      && isNonEmptyString(maybe.avatarUrl)
      && isFiniteNumber(maybe.lastSearchedAt)
  }

  return ok
}

function readRecentUsersFromStorage(): RecentGitHubUser[] {
  let users: RecentGitHubUser[] = []

  if (typeof window !== 'undefined') {
    const raw = window.localStorage.getItem(StorageKeys.RecentUsers)

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown

        if (Array.isArray(parsed)) {
          users = parsed.filter(isRecentGitHubUser)
        }
      }
      catch {
        // ignore
      }
    }
  }

  return users.slice(0, RECENT_USERS_LIMIT)
}

function writeRecentUsersToStorage(users: RecentGitHubUser[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      StorageKeys.RecentUsers,
      JSON.stringify(users.slice(0, RECENT_USERS_LIMIT)),
    )
  }
}

export function useRecentUsers() {
  const [recentUsers, setRecentUsers] = useState<RecentGitHubUser[]>(() => {
    return []
  })

  useEffect(() => {
    setRecentUsers(readRecentUsersFromStorage())
  }, [])

  const addRecentUser = useEvent((user: { login: string, avatarUrl: string }) => {
    setRecentUsers((prev) => {
      const now = Date.now()
      const normalizedLogin = user.login.trim()
      const normalizedAvatarUrl = user.avatarUrl.trim()

      const nextUser: RecentGitHubUser = {
        login: normalizedLogin,
        avatarUrl: normalizedAvatarUrl,
        lastSearchedAt: now,
      }

      const deduped = prev.filter((u) => u.login !== normalizedLogin)
      const next = [nextUser, ...deduped].slice(0, RECENT_USERS_LIMIT)

      writeRecentUsersToStorage(next)

      return next
    })
  })

  const removeRecentUser = useEvent((login: string) => {
    setRecentUsers((prev) => {
      const normalizedLogin = login.trim()
      const next = prev.filter((u) => u.login !== normalizedLogin)

      writeRecentUsersToStorage(next)

      return next
    })
  })

  const clearRecentUsers = useEvent(() => {
    setRecentUsers(() => {
      const next: RecentGitHubUser[] = []
      writeRecentUsersToStorage(next)

      return next
    })
  })

  return {
    recentUsers,
    addRecentUser,
    removeRecentUser,
    clearRecentUsers,
    storageKey: StorageKeys.RecentUsers,
    limit: RECENT_USERS_LIMIT,
  }
}
