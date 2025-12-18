'use client'

import { useTranslations } from 'next-intl'
import { CalendarIcon, LogInIcon, LogOutIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from '~/components/ui/menu'
import { Spinner } from '~/components/ui/spinner'
import { getCurrentYear } from '~/helpers'
import { authClient, useSession } from '~/lib/auth-client'

interface ExtendedUser {
  name?: string | null
  email?: string | null
  image?: string | null
  login?: string
}

export function AuthStatusButton() {
  const { data: session, isPending } = useSession()
  const t = useTranslations('auth')
  const currentYear = getCurrentYear()

  if (isPending) {
    return (
      <Button disabled size="icon" variant="outline">
        <Spinner />
      </Button>
    )
  }

  if (session?.user) {
    const user = session.user as ExtendedUser
    const displayName = user.name ?? user.login ?? 'User'
    const avatarUrl = user.image ?? ''
    const initials = displayName.slice(0, 2).toUpperCase()

    const handleSignOut = () => {
      void authClient.signOut()
    }

    const handleYearReview = () => {
      const username = user.login || user.name || ''
      const url = username ? `/year/${currentYear}/${username}` : '/year'

      window.open(url, '_blank')
    }

    return (
      <Menu>
        <MenuTrigger
          render={(props) => (
            <button
              type="button"
              {...props}
              className="flex items-center rounded-full p-1 bg-foreground/10 overflow-hidden"
            >
              <Avatar className="size-8">
                <AvatarImage alt={displayName} src={avatarUrl} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          )}
        />

        <MenuPopup className="min-w-32">
          <div className="px-1 text-sm">
            <div className="font-medium">{displayName}</div>
            {user.login && (
              <div className="text-muted-foreground">@{user.login}</div>
            )}
          </div>

          <MenuSeparator />

          <MenuItem onClick={handleYearReview}>
            <CalendarIcon />
            {t('yearReview', { year: currentYear })}
          </MenuItem>

          <MenuItem onClick={handleSignOut}>
            <LogOutIcon />
            {t('signOut')}
          </MenuItem>
        </MenuPopup>
      </Menu>
    )
  }

  const handleSignIn = () => {
    void authClient.signIn.social({
      provider: 'github',
    })
  }

  // 未登录状态
  return (
    <Button
      variant="outline"
      onClick={handleSignIn}
    >
      <LogInIcon />
      <span className="hidden sm:inline">{t('signIn')}</span>
    </Button>
  )
}
