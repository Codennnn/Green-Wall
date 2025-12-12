import { UserCard } from './UserCard'
import type { RecentGitHubUser } from './useRecentUsers'

interface RecentUsersSectionProps {
  users: RecentGitHubUser[]
  isLoading?: boolean
  loadingLogin?: string | null
  onSelect?: (login: string) => void
  onRemove?: (login: string) => void
  onClear?: () => void
}

function formatLastSearchedAt(ms: number) {
  const date = new Date(ms)
  const ok = Number.isFinite(date.getTime())

  if (!ok) {
    return ''
  }

  // 使用固定的 locale 和格式，确保服务器端和客户端输出一致
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')

  return `${month}/${day} ${hour}:${minute}`
}

export function RecentUsersSection(props: RecentUsersSectionProps) {
  const {
    users,
    onSelect,
    onRemove,
    isLoading,
    loadingLogin,
  } = props

  const hasUsers = users.length > 0

  if (hasUsers) {
    return (
      <section className="rounded-2xl border border-main-200 bg-main-50/40 p-5 shadow-sm">
        <div className="flex items-end justify-between gap-x-4">
          <div>
            <h2 className="text-base font-semibold text-main-600">
              Recently viewed
            </h2>
            <p className="mt-1 text-sm text-main-400">
              Pick up where you left off
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {users.map((user) => {
            const cardLoading = Boolean(isLoading && loadingLogin && loadingLogin === user.login)
            const badgeText = `Last viewed ${formatLastSearchedAt(user.lastSearchedAt)}`

            return (
              <UserCard
                key={user.login}
                avatarUrl={user.avatarUrl}
                badgeText={badgeText}
                isLoading={cardLoading}
                login={user.login}
                onRemove={onRemove}
                onSelect={onSelect}
              />
            )
          })}
        </div>
      </section>
    )
  }

  return null
}
