import { useTranslations } from 'next-intl'
import { ChevronRightIcon, FolderGit2Icon, XIcon } from 'lucide-react'

import { InteractionBadges } from '~/components/InteractionBadges'
import { StaticCard, StaticCardTitle } from '~/components/StaticCard'
import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { Tabs, TabsList, TabsTab } from '~/components/ui/tabs'
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { ReposCardMode } from '~/enums'
import { numberWithCommas } from '~/helpers'
import { cn } from '~/lib/utils'
import type { RepoInfo, RepoInteraction } from '~/types'

function StarIcon() {
  return (
    <svg
      className="inline-block"
      fill="currentColor"
      height="12"
      viewBox="0 0 24 24"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0h24v24H0z"
        fill="none"
        stroke="none"
      />
      <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.622 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
    </svg>
  )
}

interface RepoItemProps {
  url: string
  name: string
  description?: string | null
  stargazerCount?: number
  forkCount?: number
  showRemove: boolean
  mode: ReposCardMode
  interaction?: RepoInteraction['interaction']
  onRemove?: () => void
}

function RepoItem(props: RepoItemProps) {
  const {
    url,
    name,
    description,
    stargazerCount,
    showRemove,
    mode,
    interaction,
    onRemove,
  } = props

  const t = useTranslations('stats')

  const handleRemove = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()
    onRemove?.()
  }

  const match = /^([^/]+)\/(.+)$/.exec(name)
  const owner = match?.at(1)
  const repo = match?.at(2)

  const handleViewAnalysis = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()

    window.open(`/repo/${owner}/${repo}`, '_blank')
  }

  const showInteraction = mode === ReposCardMode.Interactions && interaction

  return (
    <li className="group">
      <a
        className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
        href={url}
        rel="noreferrer"
        target="_blank"
      >
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate font-medium">
            {name}
          </span>

          <TooltipProvider>
            <div className="shrink-0 flex items-center gap-1 text-muted-foreground/90 text-xs tabular-nums">
              <div className="relative hidden group-hover:block min-w-6">
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <Button
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground bg-background hover:bg-muted"
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={handleViewAnalysis}
                      >
                        <ChevronRightIcon />
                      </Button>
                    )}
                  />
                  <TooltipPopup side="top">
                    {t('viewRepoAnalysis')}
                  </TooltipPopup>
                </Tooltip>
              </div>

              {showRemove && (
                <div className="relative hidden group-hover:block min-w-6">
                  <Tooltip>
                    <TooltipTrigger
                      render={(
                        <Button
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground bg-background hover:bg-muted"
                          size="icon-xs"
                          type="button"
                          variant="ghost"
                          onClick={handleRemove}
                        >
                          <XIcon />
                        </Button>
                      )}
                    />
                    <TooltipPopup side="top">
                      {t('removeRepo')}
                    </TooltipPopup>
                  </Tooltip>
                </div>
              )}
            </div>
          </TooltipProvider>

          {typeof stargazerCount === 'number' && stargazerCount > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon />
              {numberWithCommas(stargazerCount)}
            </div>
          )}
        </div>

        {showInteraction && (
          <div className="mt-1">
            <InteractionBadges
              forkCount={props.forkCount}
              interaction={interaction}
              stargazerCount={stargazerCount}
            />
          </div>
        )}

        {!!description && (
          <div className="mt-1 line-clamp-2 text-foreground/70 text-xs">
            {description}
          </div>
        )}
      </a>
    </li>
  )
}

export interface ReposCardProps {
  icon: React.ReactNode
  title: string
  mode: ReposCardMode
  /** 用户在指定年份创建的仓库列表 */
  createdRepos: RepoInfo[]
  createdLoading: boolean
  createdError: Error | null
  /** 用户自有仓库中在指定年份有交互活动的仓库列表 */
  interactionRepos: RepoInteraction[]
  interactionLoading: boolean
  interactionError: Error | null
  onModeChange?: (mode: ReposCardMode) => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onRemoveRepo?: (repoUrl: string) => void
}

export function ReposCard(props: ReposCardProps) {
  const {
    icon,
    title,
    mode,
    createdRepos,
    createdLoading,
    createdError,
    interactionRepos,
    interactionLoading,
    interactionError,
    onModeChange,
    onMouseEnter,
    onMouseLeave,
    onRemoveRepo,
  } = props

  const t = useTranslations('stats')
  const tErrors = useTranslations('errors')
  const tRepoAnalysis = useTranslations('repoAnalysis')
  const showRemove = Boolean(onRemoveRepo)

  const isLoading = mode === ReposCardMode.Created ? createdLoading : interactionLoading
  const error = mode === ReposCardMode.Created ? createdError : interactionError
  const repos = mode === ReposCardMode.Created ? createdRepos : interactionRepos
  const errorMessage = tErrors('failedLoadRepos')

  const handleModeChange = (value: unknown) => {
    if (value === ReposCardMode.Created || value === ReposCardMode.Interactions) {
      onModeChange?.(value as ReposCardMode)
    }
  }

  return (
    <div
      className="h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StaticCard>
        <div className="flex items-center justify-between gap-grid-item p-grid-item">
          <StaticCardTitle icon={icon}>
            {title}
          </StaticCardTitle>

          <Tabs
            value={mode}
            onValueChange={handleModeChange}
          >
            <TabsList>
              <TabsTab value={ReposCardMode.Interactions}>
                {t('reposModeInteractions')}
              </TabsTab>
              <TabsTab value={ReposCardMode.Created}>
                {t('reposModeCreated')}
              </TabsTab>
            </TabsList>
          </Tabs>
        </div>

        <div className={cn(repos.length > 4 ? 'h-64' : 'h-52')}>
          <ScrollArea scrollFade className="h-full pt-grid-item-sm p-grid-item">
            {isLoading
              ? (
                  <ul className="flex flex-col gap-3 px-grid-item">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <li key={index}>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              : error
                ? (
                    <div className="flex h-full items-center justify-center text-destructive text-sm">
                      {errorMessage}
                    </div>
                  )
                : repos.length > 0
                  ? (
                      <ul className="flex flex-col gap-1 pr-1">
                        {mode === ReposCardMode.Created
                          ? (repos as RepoInfo[]).map((repo) => (
                              <RepoItem
                                key={repo.url}
                                description={repo.description}
                                mode={mode}
                                name={repo.name}
                                showRemove={showRemove}
                                stargazerCount={repo.stargazerCount}
                                url={repo.url}
                                onRemove={() => onRemoveRepo?.(repo.url)}
                              />
                            ))
                          : (repos as RepoInteraction[]).map((repo) => (
                              <RepoItem
                                key={repo.url}
                                description={repo.description}
                                forkCount={repo.forkCount}
                                interaction={repo.interaction}
                                mode={mode}
                                name={repo.nameWithOwner}
                                showRemove={showRemove}
                                stargazerCount={repo.stargazerCount}
                                url={repo.url}
                                onRemove={() => onRemoveRepo?.(repo.url)}
                              />
                            ))}
                      </ul>
                    )
                  : (
                      <Empty className="h-full border-0 p-0">
                        <EmptyHeader>
                          <EmptyMedia variant="icon">
                            <FolderGit2Icon />
                          </EmptyMedia>
                          <EmptyTitle className="text-sm">
                            {tRepoAnalysis('emptyState.title')}
                          </EmptyTitle>
                          <EmptyDescription className="text-xs">
                            {tRepoAnalysis('emptyState.description')}
                          </EmptyDescription>
                        </EmptyHeader>
                      </Empty>
                    )}
          </ScrollArea>
        </div>
      </StaticCard>
    </div>
  )
}
