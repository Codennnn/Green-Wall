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

  const parts = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }).formatToParts(date)

  const month = parts.find((p) => p.type === 'month')?.value ?? '00'
  const day = parts.find((p) => p.type === 'day')?.value ?? '00'
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'

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
      <section className="border-main-200 bg-main-50/40 rounded-2xl border p-5 shadow-xs">
        <div className="flex items-end justify-between gap-x-4">
          <div>
            <h2 className="text-main-600 text-base font-semibold">
              Recently viewed
            </h2>
            <p className="text-main-400 mt-1 text-sm">
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
