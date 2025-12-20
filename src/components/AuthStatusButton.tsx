'use client'

import { useTranslations } from 'next-intl'
import { CalendarIcon, LogInIcon, LogOutIcon } from 'lucide-react'

import { LoginBenefitsPopoverContent } from '~/components/LoginBenefitsPopoverContent'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from '~/components/ui/menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { Spinner } from '~/components/ui/spinner'
import { getCurrentYear } from '~/helpers'
import { useCurrentPathWithSearch } from '~/hooks/useCurrentPathWithSearch'
import { eventTracker } from '~/lib/analytics'
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
  const callbackURL = useCurrentPathWithSearch()

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
      eventTracker.auth.signOut.click()
      void authClient.signOut()
    }

    const handleYearReview = () => {
      const username = user.login || user.name || ''
      const url = username ? `/year/${currentYear}/${username}` : '/year'

      eventTracker.auth.yearReview.open(currentYear, Boolean(user.login))
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
    eventTracker.auth.signIn.click('header')
    void authClient.signIn.social({
      provider: 'github',
      callbackURL,
    })
  }

  // 未登录状态
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        closeDelay={100}
        delay={100}
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            variant="outline"
            onClick={(event) => {
              const e = event as React.MouseEvent<HTMLElement> & {
                preventBaseUIHandler?: () => void
              }
              e.preventBaseUIHandler?.()
              handleSignIn()
            }}
          >
            <LogInIcon />
            <span className="hidden sm:inline">{t('signIn')}</span>
          </Button>
        )}
      />

      <PopoverContent
        align="end"
        className="w-[min(92vw,340px)]"
        side="bottom"
        sideOffset={8}
      >
        <LoginBenefitsPopoverContent />
      </PopoverContent>
    </Popover>
  )
}
