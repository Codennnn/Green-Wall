import { useTranslations } from 'next-intl'

import { DiscoverySection } from './DiscoverySection'
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

  const t = useTranslations('discovery')
  const hasUsers = users.length > 0

  const section = hasUsers
    ? (
        <DiscoverySection
          description={t('recentDescription')}
          title={t('recentlyViewed')}
        >
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {users.map((user) => {
              const cardLoading = Boolean(isLoading && loadingLogin && loadingLogin === user.login)
              const badgeText = t('lastViewed', { time: formatLastSearchedAt(user.lastSearchedAt) })

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
        </DiscoverySection>
      )
    : null

  return section
}
