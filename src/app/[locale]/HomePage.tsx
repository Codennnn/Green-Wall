'use client'

import { useEffect, useId, useRef } from 'react'

import { useTranslations } from 'next-intl'
import { DotIcon } from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { GraphActionBar } from '~/components/GraphActionBar'
import { Loading } from '~/components/Loading/Loading'
import { SearchForm } from '~/components/SearchForm'
import { Separator } from '~/components/ui/separator'
import { FamousUsersSection } from '~/components/UserDiscovery/FamousUsersSection'
import { useRecentUsers } from '~/components/UserDiscovery/useRecentUsers'
import { useData } from '~/DataContext'
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

  const { graphData, setGraphData, dispatchSettings, settings } = useData()

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
    yearRange: settings.yearRange,
  })

  useEffect(() => {
    if (settingPopupPosition) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeSettingPopup()
        }
      }

      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [settingPopupPosition, closeSettingPopup])

  const loadingUsername = isLoading ? urlUsername : null

  const handleRemoveRecentUser = (login: string) => {
    removeRecentUser(login)
  }

  const handleSettingClick = () => {
    if (settingPopupPosition) {
      closeSettingPopup()
    }
  }

  const handleSettingPopOutClick = () => {
    handleSettingPopOut(settingPopoverContentId)
  }

  const handleSettingPopupClose = () => {
    closeSettingPopup()
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
                  onSettingPopupClose={handleSettingPopupClose}
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
            onSelect={(login) => {
              handleQuickSearch(login, 'famous_user')
            }}
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
        loadingLogin={loadingUsername}
        recentUsers={recentUsers}
        value={searchName}
        onChange={setSearchName}
        onRemoveUser={handleRemoveRecentUser}
        onSelectUser={(login) => {
          handleQuickSearch(login, 'recent_user')
        }}
        onSubmit={handleSubmit}
      />

      {renderContent()}
    </div>
  )
}
