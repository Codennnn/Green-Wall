'use client'

import { useId, useRef } from 'react'

import { useTranslations } from 'next-intl'
import { DotIcon } from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { GraphActionBar } from '~/components/GraphActionBar'
import { Loading } from '~/components/Loading/Loading'
import { SearchForm } from '~/components/SearchForm'
import { Separator } from '~/components/ui/separator'
import { FamousUsersSection } from '~/components/UserDiscovery/FamousUsersSection'
import { RecentUsersSection } from '~/components/UserDiscovery/RecentUsersSection'
import { useRecentUsers } from '~/components/UserDiscovery/useRecentUsers'
import { useData } from '~/DataContext'
import { trackEvent } from '~/helpers'
import { useContributionSearch } from '~/hooks/useContributionSearch'
import { useSettingPopup } from '~/hooks/useSettingPopup'
import { useUrlUsername } from '~/hooks/useUrlUsername'

function Divider() {
  return (
    <div className="w-full flex justify-center">
      <div className="my-4 flex items-center gap-x-2 w-1/2">
        <Separator className="flex-1" />
        <DotIcon className="size-4 shrink-0 text-muted-foreground" />
        <Separator className="flex-1" />
      </div>
    </div>
  )
}

export function HomePage() {
  const t = useTranslations('home')
  const graphRef = useRef<HTMLDivElement>(null)

  const settingPopoverContentId = useId()
  const graphWrapperId = useId()

  const { graphData, setGraphData, dispatchSettings } = useData()

  const {
    urlUsername,
    rawUrlUsername,
    isInvalidUrlUsername,
    setUsernameInUrl,
  } = useUrlUsername()

  const {
    recentUsers,
    addRecentUser,
    removeRecentUser,
  } = useRecentUsers()

  const {
    settingPopupPosition,
    closeSettingPopup,
    graphActionsRefCallback,
    handleSettingPopOut,
  } = useSettingPopup(graphWrapperId)

  const {
    searchName,
    setSearchName,
    isLoading,
    error,
    handleSubmit,
    handleQuickSearch,
  } = useContributionSearch({
    urlUsername,
    isInvalidUrlUsername,
    setUsernameInUrl,
    graphData,
    setGraphData,
    resetSettings: () => {
      closeSettingPopup()
      dispatchSettings({ type: 'reset' })
    },
    addRecentUser,
  })

  const loadingUsername = isLoading ? urlUsername : null

  const handleRemoveRecentUser = (login: string) => {
    removeRecentUser(login)
    trackEvent('Click Remove Recent User', { username: login })
  }

  const handleSettingClick = () => {
    if (settingPopupPosition) {
      closeSettingPopup()
    }
  }

  const handleSettingPopOutClick = () => {
    handleSettingPopOut(settingPopoverContentId)
  }

  const renderContent = () => {
    if (error) {
      return <ErrorMessage errorType={error.errorType} text={error.message} />
    }

    if (isLoading || graphData) {
      return (
        <Loading active={isLoading}>
          {graphData && (
            <>
              <div
                ref={graphActionsRefCallback}
                className="flex flex-row-reverse flex-wrap items-center justify-center gap-x-6 gap-y-4 py-5"
              >
                <GraphActionBar
                  graphRef={graphRef}
                  settingPopoverContentId={settingPopoverContentId}
                  settingPopupPosition={settingPopupPosition}
                  username={graphData.login}
                  onSettingClick={handleSettingClick}
                  onSettingPopOut={handleSettingPopOutClick}
                  onSettingPopupClose={closeSettingPopup}
                />
              </div>

              <Divider />

              <div className="flex overflow-x-auto md:justify-center">
                <ContributionsGraph
                  ref={graphRef}
                  wrapperId={graphWrapperId}
                />
              </div>
            </>
          )}
        </Loading>
      )
    }

    if (!rawUrlUsername) {
      return (
        <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-y-6">
          <FamousUsersSection
            isLoading={isLoading}
            loadingLogin={loadingUsername}
            onSelect={handleQuickSearch}
          />
          <RecentUsersSection
            isLoading={isLoading}
            loadingLogin={loadingUsername}
            users={recentUsers}
            onRemove={handleRemoveRecentUser}
            onSelect={handleQuickSearch}
          />
        </div>
      )
    }

    return null
  }

  return (
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-4xl md:leading-[1.2] lg:text-6xl">
        {t('title')}
      </h1>

      <SearchForm
        isLoading={isLoading}
        value={searchName}
        onChange={setSearchName}
        onSubmit={handleSubmit}
      />

      {renderContent()}
    </div>
  )
}
