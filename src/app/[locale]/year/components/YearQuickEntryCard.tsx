'use client'

import { useTranslations } from 'next-intl'
import { RefreshCwIcon, SparklesIcon } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import { Card, CardPanel } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { authClient } from '~/lib/auth-client'

export interface YearQuickEntryUser {
  name?: string | null
  login?: string
  image?: string | null
}

interface YearQuickEntryCardProps {
  currentYear: number
  user: YearQuickEntryUser | null
  disabled?: boolean
  isPending?: boolean
  onViewMyYear: () => void
}

export function YearQuickEntryCard({
  currentYear,
  user,
  disabled = false,
  isPending = false,
  onViewMyYear,
}: YearQuickEntryCardProps) {
  const t = useTranslations('yearSearch')

  if (isPending) {
    return (
      <Card className="mx-auto max-w-md py-4">
        <CardPanel>
          <div className="flex items-center gap-4">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardPanel>
      </Card>
    )
  }

  if (!user) {
    return null
  }

  const displayName = user.name ?? user.login ?? 'User'
  const avatarUrl = user.image ?? ''
  const initials = displayName.slice(0, 2).toUpperCase()
  const hasLogin = Boolean(user.login)

  if (!hasLogin) {
    const handleReSignIn = () => {
      void authClient.signIn.social({ provider: 'github' })
    }

    return (
      <Card className="mx-auto max-w-md py-4">
        <CardPanel>
          <Alert variant="warning">
            <AlertTitle>{t('loginMissingTitle')}</AlertTitle>
            <AlertDescription className="flex items-center justify-between gap-4">
              <span>{t('loginMissingDesc')}</span>
              <Button size="sm" variant="outline" onClick={handleReSignIn}>
                <RefreshCwIcon className="ize-4" />
                {t('reSignIn')}
              </Button>
            </AlertDescription>
          </Alert>
        </CardPanel>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-md py-4">
      <CardPanel>
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            <AvatarImage alt={displayName} src={avatarUrl} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{displayName}</div>
            <div className="truncate text-sm text-muted-foreground">
              @{user.login}
            </div>
          </div>

          <Button disabled={disabled} onClick={onViewMyYear}>
            <SparklesIcon />
            {t('myQuickEntryCta', { year: currentYear })}
          </Button>
        </div>
      </CardPanel>
    </Card>
  )
}
