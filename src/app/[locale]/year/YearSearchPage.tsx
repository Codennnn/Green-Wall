'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { GenerateButton } from '~/components/GenerateButton/GenerateButton'
import { SearchInput } from '~/components/SearchInput'
import { Separator } from '~/components/ui/separator'
import { useRecentUsers } from '~/components/UserDiscovery/useRecentUsers'
import { YearSelect } from '~/components/YearSelect/YearSelect'
import { getCurrentYear, normalizeGitHubUsername } from '~/helpers'
import { usePersistedSearchInput } from '~/hooks/usePersistedSearchInput'
import { eventTracker } from '~/lib/analytics'
import { useSession } from '~/lib/auth-client'

import { YearQuickEntryCard } from './components/YearQuickEntryCard'
import { useYearWrappedNavigation } from './hooks/useYearWrappedNavigation'

export function YearSearchPage() {
  const t = useTranslations('yearSearch')
  const { data: session, isPending: isSessionPending } = useSession()

  const currentYear = getCurrentYear()

  const { value: username, setValue: setUsername } = usePersistedSearchInput()
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear))

  const { isNavigating, navigateToYearUser } = useYearWrappedNavigation()
  const { recentUsers, removeRecentUser } = useRecentUsers()

  const isLoggedIn = Boolean(session?.user)
  const user = session?.user
    ? {
        name: session.user.name,
        login: (session.user as { login?: string }).login,
        image: session.user.image,
      }
    : null

  const handleUsernameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(ev.target.value)
  }

  const handleYearChange = (value: string | null) => {
    if (value !== null) {
      setSelectedYear(value)
    }
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()

    const normalizedUsername = normalizeGitHubUsername(username)
    const year = Number(selectedYear)

    if (normalizedUsername && year) {
      eventTracker.year.search.submit(year, 'manual')
      navigateToYearUser({ year, username: normalizedUsername })
    }
  }

  const handleViewMyYear = () => {
    if (user?.login) {
      eventTracker.year.quickEntry.click(currentYear, true)
      navigateToYearUser({ year: currentYear, username: user.login })
    }
  }

  const handleSelectUser = (login: string) => {
    const year = Number(selectedYear)

    if (login && year) {
      eventTracker.year.search.submit(year, 'quick_entry')
      navigateToYearUser({ year, username: login })
    }
  }

  const handleRemoveUser = (login: string) => {
    removeRecentUser(login)
  }

  return (
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-4xl md:leading-[1.2] lg:text-5xl">
        {t('titleWithYear', { year: currentYear })}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {t('descriptionWithYear', { year: currentYear })}
      </p>

      {isLoggedIn && (
        <>
          <div className="mt-8">
            <YearQuickEntryCard
              currentYear={currentYear}
              disabled={isNavigating}
              isPending={isSessionPending}
              user={user}
              onViewMyYear={handleViewMyYear}
            />
          </div>
          <div className="mx-auto mt-8 flex max-w-md items-center gap-4">
            <Separator className="flex-1" />
            <span className="shrink-0 text-sm text-muted-foreground">
              {t('orSearchOthers')}
            </span>
            <Separator className="flex-1" />
          </div>
        </>
      )}

      <div className="py-8 md:py-12">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
            <SearchInput
              disabled={isNavigating}
              isLoading={isNavigating}
              loadingLogin={null}
              placeholder={t('usernamePlaceholder')}
              recentUsers={recentUsers}
              translationNamespace="yearSearch"
              value={username}
              onChange={handleUsernameChange}
              onRemoveUser={handleRemoveUser}
              onSelectUser={handleSelectUser}
            />

            <YearSelect
              disabled={isNavigating}
              triggerClassName="h-[2.8rem] w-[120px]"
              value={selectedYear}
              valueClassName="text-xl"
              onValueChange={handleYearChange}
            />

            <GenerateButton loading={isNavigating} type="submit">
              {t('viewWrapped')}
            </GenerateButton>
          </div>
        </form>
      </div>
    </div>
  )
}
