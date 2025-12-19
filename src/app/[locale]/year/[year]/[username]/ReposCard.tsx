import { useTranslations } from 'next-intl'
import { FolderGit2Icon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '~/components/ui/empty'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import type { RepoInfo } from '~/types'

import { StatCard } from './StaticCard'

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

export interface ReposCardProps {
  icon: React.ReactNode
  title: string
  isLoading: boolean
  error: Error | null
  repos: RepoInfo[]
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onRemoveRepo?: (repoUrl: string) => void
}

export function ReposCard(props: ReposCardProps) {
  const {
    icon,
    title,
    isLoading,
    error,
    repos,
    onMouseEnter,
    onMouseLeave,
    onRemoveRepo,
  } = props

  const tErrors = useTranslations('errors')
  const showRemove = Boolean(onRemoveRepo)

  return (
    <StatCard
      icon={icon}
      title={title}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-60">
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
                    {tErrors('failedLoadRepos')}
                  </div>
                )
              : repos.length === 0
                ? (
                    <Empty className="h-full border-0 p-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <FolderGit2Icon />
                        </EmptyMedia>
                        <EmptyDescription>
                          {tErrors('noRepos')}
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )
                : (
                    <ul className="flex flex-col gap-1 pr-1">
                      {repos.map((repo: RepoInfo) => {
                        const handleRemove = (ev: React.MouseEvent<HTMLButtonElement>) => {
                          ev.stopPropagation()
                          ev.preventDefault()
                          onRemoveRepo?.(repo.url)
                        }

                        return (
                          <li key={repo.url} className="group">
                            <a
                              className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                              href={repo.url}
                              rel="noreferrer"
                              target="_blank"
                            >
                              <div className="flex items-center gap-2">
                                <span className="min-w-0 flex-1 truncate font-medium">
                                  {repo.name}
                                </span>

                                <div className="shrink-0 flex items-center gap-1 text-muted-foreground/90 text-xs tabular-nums">
                                  {showRemove && (
                                    <div className="relative hidden group-hover:block min-w-6">
                                      <Button
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground bg-background hover:bg-muted"
                                        size="icon-xs"
                                        type="button"
                                        variant="ghost"
                                        onClick={handleRemove}
                                      >
                                        <XIcon />
                                      </Button>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-1">
                                    <StarIcon />
                                    {repo.stargazerCount}
                                  </div>
                                </div>
                              </div>

                              {repo.description
                                ? (
                                    <div className="mt-1 line-clamp-2 text-foreground/70 text-xs">
                                      {repo.description}
                                    </div>
                                  )
                                : null}
                            </a>
                          </li>
                        )
                      })}
                    </ul>
                  )}
        </ScrollArea>
      </div>
    </StatCard>
  )
}
