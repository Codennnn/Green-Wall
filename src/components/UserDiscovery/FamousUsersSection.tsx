import { useTranslations } from 'next-intl'

import { eventTracker } from '~/lib/analytics'
import type { GitHubUser } from '~/types'

import { DiscoverySection } from './DiscoverySection'
import { UserCard } from './UserCard'

interface FamousUsersSectionProps {
  isLoading?: boolean
  loadingLogin?: string | null
  onSelect?: (login: string) => void
}

const FAMOUS_USERS: { login: GitHubUser['login'], badgeKey: string }[] = [
  { login: 'torvalds', badgeKey: 'torvalds' },
  { login: 'gaearon', badgeKey: 'gaearon' },
  { login: 'tj', badgeKey: 'tj' },
  { login: 'sindresorhus', badgeKey: 'sindresorhus' },
  { login: 'yyx990803', badgeKey: 'yyx990803' },
  { login: 'rvagg', badgeKey: 'rvagg' },
  { login: 'afc163', badgeKey: 'afc163' },
  { login: 'antfu', badgeKey: 'antfu' },
]

function buildGitHubAvatarUrl(login: string, size = 80) {
  const normalizedLogin = login.trim()

  return `https://github.com/${normalizedLogin}.png?size=${size}`
}

export function FamousUsersSection(props: FamousUsersSectionProps) {
  const { onSelect, isLoading, loadingLogin } = props
  const t = useTranslations('discovery')

  return (
    <DiscoverySection
      description={t('popularDescription')}
      title={t('popularProfiles')}
    >
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {FAMOUS_USERS.map((user, index) => {
          const cardLoading = Boolean(isLoading && loadingLogin && loadingLogin === user.login)
          const badgeText = t(`famousUsers.${user.badgeKey}`)

          return (
            <UserCard
              key={user.login}
              avatarUrl={buildGitHubAvatarUrl(user.login)}
              badgeText={badgeText}
              isLoading={cardLoading}
              login={user.login}
              onSelect={(login) => {
                eventTracker.discovery.userClick('famous', FAMOUS_USERS.length, index + 1)
                onSelect?.(login)
              }}
            />
          )
        })}
      </div>
    </DiscoverySection>
  )
}
