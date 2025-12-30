import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

import type { GitHubUser } from '../types'

export interface UserAvatarProps {
  name?: GitHubUser['name'] | null
  login?: GitHubUser['login'] | null
  avatarUrl?: string | null
  className?: string
  alt?: string
}

function getAvatarFallback(
  name: UserAvatarProps['name'],
  login: UserAvatarProps['login'],
): string {
  const displayName = name ?? login ?? 'User'

  return displayName.slice(0, 2).toUpperCase()
}

function getDisplayName(name: UserAvatarProps['name'], login: UserAvatarProps['login']): string {
  return name ?? login ?? 'User'
}

export function UserAvatar({
  name,
  login,
  avatarUrl,
  className = 'size-8',
  alt,
}: UserAvatarProps) {
  const displayName = getDisplayName(name, login)
  const initials = getAvatarFallback(name, login)
  const altText = alt ?? displayName

  return (
    <Avatar className={className}>
      <AvatarImage alt={altText} src={avatarUrl ?? ''} />
      <AvatarFallback>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
