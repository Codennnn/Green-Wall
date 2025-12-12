import type { GitHubUser } from '~/types'

import { UserCard } from './UserCard'

interface FamousUsersSectionProps {
  isLoading?: boolean
  loadingLogin?: string | null
  onSelect?: (login: string) => void
}

const FAMOUS_USERS: { login: GitHubUser['login'], badgeText?: string }[] = [
  { login: 'torvalds', badgeText: 'Linux' },
  { login: 'gaearon', badgeText: 'React' },
  { login: 'tj', badgeText: 'JavaScript' },
  { login: 'sindresorhus', badgeText: 'Open Source' },
]

function buildGitHubAvatarUrl(login: string, size = 80) {
  const normalizedLogin = login.trim()

  return `https://github.com/${normalizedLogin}.png?size=${size}`
}

export function FamousUsersSection(props: FamousUsersSectionProps) {
  const { onSelect, isLoading, loadingLogin } = props

  return (
    <section className="rounded-2xl border border-main-200 bg-main-50/40 p-5 shadow-sm">
      <div className="flex items-end justify-between gap-x-4">
        <div>
          <h2 className="text-base font-semibold text-main-600">
            Popular profiles
          </h2>
          <p className="mt-1 text-sm text-main-400">
            Quick picks to explore contributions
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {FAMOUS_USERS.map((user) => {
          const cardLoading = Boolean(isLoading && loadingLogin && loadingLogin === user.login)

          return (
            <UserCard
              key={user.login}
              avatarUrl={buildGitHubAvatarUrl(user.login)}
              badgeText={user.badgeText}
              isLoading={cardLoading}
              login={user.login}
              onSelect={onSelect}
            />
          )
        })}
      </div>
    </section>
  )
}
