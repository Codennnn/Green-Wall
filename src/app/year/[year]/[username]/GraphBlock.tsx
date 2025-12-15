import { useEffect, useMemo, useState } from 'react'

import { useParams } from 'next/navigation'
import {
  ArrowBigUpDashIcon,
  Calendar1Icon,
  CalendarArrowUpIcon,
  CalendarDaysIcon,
  CalendarMinus2Icon,
  FolderGit2Icon,
  MessageSquareQuoteIcon,
  ScaleIcon,
  SquareCodeIcon,
} from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import type { GraphHighlightMode, GraphHighlightOptions } from '~/components/ContributionsGraph/graphHighlightUtils'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import {
  useContributionQuery,
  useIssuesQuery,
  useReposQuery,
} from '~/hooks/useQueries'
import { getTopLanguagesFromRepos } from '~/lib/language-stats'
import {
  deriveStatistics,
  formatStatDate,
  formatStatMonth,
} from '~/lib/statistics'
import type { IssueInfo, RepoInfo } from '~/types'

import { StatCardWithPopover } from './StatCardWithPopover'
import { StatCard } from './StaticCard'
import { TopLanguagesCard } from './TopLanguagesCard'

export function GraphBlock() {
  const { year, username } = useParams()
  const queryYear = Number(year)
  const githubUsername = String(username)

  const { setGraphData } = useData()

  const {
    data: contributionData,
    isLoading: contributionLoading,
  } = useContributionQuery(githubUsername, [queryYear], true, {
    staleTime: 10 * 60 * 1000, // 10 分钟
    gcTime: 60 * 60 * 1000, // 1 小时
  })

  const {
    data: reposData,
    isLoading: reposLoading,
    error: reposError,
  } = useReposQuery(
    githubUsername,
    queryYear,
  )

  const {
    data: issuesData,
    isLoading: issuesLoading,
    error: issuesError,
  } = useIssuesQuery(
    githubUsername,
    queryYear,
  )

  const statistics = useMemo(() => deriveStatistics(contributionData), [contributionData])
  const topLanguages = useMemo(() => {
    return getTopLanguagesFromRepos(reposData?.repos, { limit: 5 })
  }, [reposData?.repos])

  // 高亮状态管理
  const [highlightMode, setHighlightMode] = useState<GraphHighlightMode>('none')
  const [highlightOptions, setHighlightOptions] = useState<
    GraphHighlightOptions | undefined
  >(undefined)

  useEffect(() => {
    if (contributionData) {
      setGraphData(contributionData)
    }
  }, [contributionData, setGraphData])

  const isLoading = contributionLoading

  const formatStatDateRange = (
    startDate: string | undefined,
    endDate: string | undefined,
  ): string | undefined => {
    if (!startDate || !endDate) {
      return undefined
    }

    if (startDate === endDate) {
      return formatStatDate(startDate)
    }

    return `${formatStatDate(startDate)} - ${formatStatDate(endDate)}`
  }

  // 清除高亮的处理器
  const handleClearHighlight = () => {
    setHighlightMode('none')
    setHighlightOptions(undefined)
  }

  return (
    <div className="flex flex-col items-center py-5">
      <Loading active={isLoading}>
        {isLoading || !contributionData
          ? (
              <div className="h-[265px] w-full" />
            )
          : (
              <ContributionsGraph
                highlightMode={highlightMode}
                highlightOptions={highlightOptions}
                showInspect={false}
                titleRender={() => null}
              />
            )}
      </Loading>

      <>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <StatCard
            icon={<ArrowBigUpDashIcon className="size-5" />}
            isLoading={!statistics}
            title="Max Contributions in a Day"
            value={statistics?.maxContributionsInADay}
            onMouseEnter={() => {
              if (statistics?.maxContributionsDate) {
                setHighlightMode('specificDate')
                setHighlightOptions({ specificDate: statistics.maxContributionsDate })
              }
            }}
            onMouseLeave={handleClearHighlight}
          />

          <StatCard
            icon={<ScaleIcon className="size-5" />}
            isLoading={!statistics}
            title="Average Per Day"
            value={statistics?.averageContributionsPerDay}
          />

          <StatCard
            icon={<Calendar1Icon className="size-5" />}
            isLoading={!statistics}
            title="Most Active Day"
            value={formatStatDate(statistics?.maxContributionsDate)}
            onMouseEnter={() => {
              if (statistics?.maxContributionsDate) {
                setHighlightMode('specificDate')
                setHighlightOptions({ specificDate: statistics.maxContributionsDate })
              }
            }}
            onMouseLeave={handleClearHighlight}
          />

          <StatCard
            icon={<CalendarArrowUpIcon className="size-5" />}
            isLoading={!statistics}
            title="Most Active Month"
            value={formatStatMonth(statistics?.maxContributionsMonth)}
            onMouseEnter={() => {
              if (statistics?.maxContributionsMonth) {
                setHighlightMode('specificMonth')
                setHighlightOptions({ specificMonth: statistics.maxContributionsMonth })
              }
            }}
            onMouseLeave={handleClearHighlight}
          />

          <StatCard
            icon={<CalendarDaysIcon className="size-5" />}
            isLoading={!statistics}
            subValue={formatStatDateRange(
              statistics?.longestStreakStartDate,
              statistics?.longestStreakEndDate,
            )}
            title="Longest Streak"
            value={statistics?.longestStreak}
            onMouseEnter={() => {
              if (statistics?.longestStreakStartDate && statistics.longestStreakEndDate) {
                setHighlightMode('longestStreak')
                setHighlightOptions(undefined)
              }
            }}
            onMouseLeave={handleClearHighlight}
          />

          <StatCard
            icon={<CalendarMinus2Icon className="size-5" />}
            isLoading={!statistics}
            subValue={formatStatDateRange(
              statistics?.longestGapStartDate,
              statistics?.longestGapEndDate,
            )}
            title="Longest Gap"
            value={statistics?.longestGap}
            onMouseEnter={() => {
              if (statistics?.longestGapStartDate && statistics.longestGapEndDate) {
                setHighlightMode('longestGap')
                setHighlightOptions({
                  longestGapRange: {
                    start: statistics.longestGapStartDate,
                    end: statistics.longestGapEndDate,
                  },
                })
              }
            }}
            onMouseLeave={handleClearHighlight}
          />

          <StatCardWithPopover
            align="start"
            ariaLabel={`Show repositories created in ${queryYear}`}
            emptyMessage="No repositories found."
            error={reposError}
            errorMessage="Failed to load repositories."
            isLoading={reposLoading}
            items={reposData?.repos ?? []}
            loadingMessage="Loading repositories..."
            popoverCount={reposData?.count}
            popoverTitle={`Repositories in ${queryYear}`}
            renderItem={(repo: RepoInfo) => {
              return (
                <a
                  className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  href={repo.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="flex items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {repo.name}
                    </span>
                    <span className="shrink-0 text-foreground/60 text-xs tabular-nums">
                      ★ {repo.stargazerCount}
                    </span>
                  </div>

                  {repo.description
                    ? (
                        <div className="mt-1 line-clamp-2 text-foreground/70 text-xs">
                          {repo.description}
                        </div>
                      )
                    : null}
                </a>
              )
            }}
            side="left"
          >
            <StatCard
              icon={<FolderGit2Icon className="size-5" />}
              isLoading={reposLoading}
              title={`Repos Created in ${queryYear}`}
              value={reposData?.count}
            />
          </StatCardWithPopover>

          <StatCardWithPopover
            align="start"
            ariaLabel={`Show issues in ${queryYear}`}
            contentClassName="w-[min(90vw,520px)]"
            emptyMessage="No issues found."
            error={issuesError}
            errorMessage="Failed to load issues."
            isLoading={issuesLoading}
            items={issuesData?.issues ?? []}
            loadingMessage="Loading issues..."
            popoverCount={issuesData?.count}
            popoverTitle={`Issues in ${queryYear}`}
            renderItem={(issue: IssueInfo) => {
              return (
                <a
                  className="block rounded-md px-2 py-2 text-sm transition-colors hover:bg-foreground/6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  href={issue.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <div className="min-w-0 font-medium">
                    <span className="block truncate">
                      {issue.title}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-foreground/70 text-xs">
                    <span className="truncate">
                      {issue.repository.nameWithOwner}
                    </span>
                  </div>
                </a>
              )
            }}
            side="right"
          >
            <StatCard
              icon={<MessageSquareQuoteIcon className="size-5" />}
              isLoading={issuesLoading}
              title={`Issues in ${queryYear}`}
              value={issuesData?.count}
            />
          </StatCardWithPopover>

          <div className="col-span-2">
            <TopLanguagesCard
              icon={<SquareCodeIcon className="size-5" />}
              isLoading={reposLoading}
              items={topLanguages}
              title={`Top Languages in ${queryYear}`}
            />
          </div>
        </div>
      </>
    </div>
  )
}
