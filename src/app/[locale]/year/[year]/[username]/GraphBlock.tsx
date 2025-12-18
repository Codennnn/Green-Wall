import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ArrowBigUpDashIcon,
  CalendarArrowUpIcon,
  CalendarDaysIcon,
  CalendarMinus2Icon,
  DownloadIcon,
  FolderGit2Icon,
  MessageSquareQuoteIcon,
  ScaleIcon,
  SquareCodeIcon,
} from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph/ContributionsGraph'
import type { GraphHighlightMode, GraphHighlightOptions } from '~/components/ContributionsGraph/graphHighlightUtils'
import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '~/components/ui/empty'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { useData } from '~/DataContext'
import { useDateFormatters } from '~/hooks/useDateFormatters'
import { useImageExport } from '~/hooks/useImageExport'
import {
  useContributionQuery,
  useIssuesQuery,
  useReposQuery,
} from '~/hooks/useQueries'
import { getTopLanguagesFromRepos } from '~/lib/language-stats'
import { deriveStatistics } from '~/lib/statistics'
import {
  deriveYearlyTags,
  extractHighlights,
} from '~/lib/yearly-report/deriveTags'
import type { IssueInfo, RepoInfo } from '~/types'

import { MonthlyCommitChart } from './charts/MonthlyCommitChart'
import { WeeklyCommitChart } from './charts/WeeklyCommitChart'
import { AiYearlyReportCard } from './AiYearlyReportCard'
import { StatCardWithPopover } from './StatCardWithPopover'
import { StatCard, StatValue } from './StaticCard'
import { TopLanguagesCard } from './TopLanguagesCard'

export function GraphBlock() {
  const { year, username, locale } = useParams()
  const queryYear = Number(year)
  const githubUsername = String(username)
  const currentLocale = String(locale)
  const t = useTranslations('stats')
  const tErrors = useTranslations('errors')

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

  const repos = reposData?.repos

  const [reposDataSet, topLanguages] = useMemo(() => {
    return [
      Array.isArray(repos) ? repos : [],
      getTopLanguagesFromRepos(repos, { limit: 5 }),
    ]
  }, [repos])

  // 年度报告标签推导
  const yearlyTags = useMemo(() => {
    return deriveYearlyTags({
      statistics,
      calendars: contributionData?.contributionCalendars,
      topLanguages,
      reposData,
      issuesData,
      locale: currentLocale,
    })
  }, [
    statistics,
    contributionData?.contributionCalendars,
    topLanguages,
    reposData,
    issuesData,
    currentLocale,
  ])

  // 年度报告高光数据
  const yearlyHighlights = useMemo(() => {
    return extractHighlights({
      statistics,
      reposData,
      issuesData,
    })
  }, [statistics, reposData, issuesData])

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

  const { formatDate, formatMonth, formatDateRange } = useDateFormatters()

  const reportContainerRef = useRef<HTMLDivElement>(null)

  const { isDownloading, handleDownload } = useImageExport(
    reportContainerRef,
    githubUsername,
    { filename: `${githubUsername}_${queryYear}_yearly_report` },
  )

  const handleDownloadClick = useEvent(() => {
    void handleDownload()
  })

  const handleClearHighlight = useEvent(() => {
    setHighlightMode('none')
    setHighlightOptions(undefined)
  })

  return (
    <div className="flex flex-col items-center py-5">
      <div className="mb-4 flex w-full justify-end">
        <Button
          disabled={isDownloading || isLoading}
          size="default"
          onClick={handleDownloadClick}
        >
          <DownloadIcon />
          {t('downloadYearlyReport')}
        </Button>
      </div>

      <div
        ref={reportContainerRef}
        className="grid w-full grid-cols-12 gap-4 bg-background p-grid-item"
      >
        {/* MARK: 贡献日历热力图 */}
        <div className="col-span-7">
          {
            isLoading
              ? (
                  <div className="p-grid-item rounded-md flex flex-col h-full gap-grid-item">
                    <div className="flex items-center gap-4">
                      <Skeleton className="size-20 rounded-full" />
                      <div className="flex-1 space-y-2.5">
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex items-center gap-2 w-2/3">
                          <Skeleton className="h-3 w-1/3" />
                          <Skeleton className="h-3 w-1/3" />
                          <Skeleton className="h-3 w-1/3" />
                        </div>
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <Skeleton className="size-full opacity-60 rounded-md" />
                    </div>
                  </div>
                )
              : (
                  <ContributionsGraph
                    highlightMode={highlightMode}
                    highlightOptions={highlightOptions}
                    mockupWrapperClassName="p-grid-item"
                    showInspect={false}
                    titleRender={() => null}
                  />
                )
          }
        </div>

        {/* MARK: AI 年度总结 */}
        <div className="col-span-5">
          <AiYearlyReportCard
            hideActions={isDownloading}
            highlights={yearlyHighlights}
            locale={currentLocale}
            tags={yearlyTags}
            username={githubUsername}
            year={queryYear}
          />
        </div>

        {/* MARK: 最活跃月份 */}
        <div className="col-span-4">
          <StatCard
            icon={<CalendarArrowUpIcon className="size-5" />}
            statValueProps={{
              isLoading: !statistics,
              value: formatMonth(statistics?.maxContributionsMonth),
            }}
            title={t('mostActiveMonth')}
            onMouseEnter={() => {
              if (statistics?.maxContributionsMonth) {
                setHighlightMode('specificMonth')
                setHighlightOptions({ specificMonth: statistics.maxContributionsMonth })
              }
            }}
            onMouseLeave={handleClearHighlight}
          />
        </div>

        {/* MARK: 平均每日 */}
        <div className="col-span-4">
          <StatCard
            icon={<ScaleIcon className="size-5" />}
            statValueProps={{
              isLoading: !statistics,
              value: statistics?.averageContributionsPerDay,
            }}
            title={t('averagePerDay')}
          />
        </div>

        {/* MARK: Issues 数量 */}
        <StatCardWithPopover
          align="start"
          ariaLabel={t('showIssues', { year: queryYear })}
          className="col-span-4"
          contentClassName="w-[min(90vw,520px)]"
          emptyMessage={tErrors('noIssues')}
          error={issuesError}
          errorMessage={tErrors('failedLoadIssues')}
          isLoading={issuesLoading}
          items={issuesData?.issues ?? []}
          popoverCount={issuesData?.count}
          popoverTitle={t('issuesIn', { year: queryYear })}
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
            statValueProps={{
              isLoading: issuesLoading,
              value: issuesData?.count,
            }}
            title={t('issues', { year: queryYear })}
          />
        </StatCardWithPopover>

        {/* MARK: 最大贡献 */}
        <div className="col-span-4 row-span-2">
          <StatCard
            icon={<ArrowBigUpDashIcon className="size-5" />}
            title={t('maxContributions')}
            onMouseEnter={() => {
              if (statistics?.maxContributionsDate) {
                setHighlightMode('specificDate')
                setHighlightOptions({ specificDate: statistics.maxContributionsDate })
              }
            }}
            onMouseLeave={handleClearHighlight}
          >
            <div className="pt-grid-item-sm p-grid-item">
              <StatValue
                large
                isLoading={!statistics}
                subValue={formatDate(statistics?.maxContributionsDate)}
                value={statistics?.maxContributionsInADay}
              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 最长连续天数 */}
        <div className="col-span-4 row-span-2">
          <StatCard
            icon={<CalendarDaysIcon className="size-5" />}
            title={t('longestStreak')}
            onMouseEnter={() => {
              if (statistics?.longestStreakStartDate && statistics.longestStreakEndDate) {
                setHighlightMode('longestStreak')
                setHighlightOptions(undefined)
              }
            }}
            onMouseLeave={handleClearHighlight}
          >
            <div className="pt-grid-item-sm p-grid-item">
              <StatValue
                large
                isLoading={!statistics}
                subValue={formatDateRange(
                  statistics?.longestStreakStartDate,
                  statistics?.longestStreakEndDate,
                )}
                value={statistics?.longestStreak}

              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 最长间隔天数 */}
        <div className="col-span-4 row-span-2">
          <StatCard
            icon={<CalendarMinus2Icon className="size-5" />}
            title={t('longestGap')}
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
          >
            <div className="pt-grid-item-sm p-grid-item">
              <StatValue
                large
                isLoading={!statistics}
                subValue={formatDateRange(
                  statistics?.longestGapStartDate,
                  statistics?.longestGapEndDate,
                )}
                value={statistics?.longestGap}
              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 仓库数量 */}
        <div className="col-span-5">
          <StatCard
            icon={<FolderGit2Icon className="size-5" />}
            title={t('reposCreated', { year: queryYear })}
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
          >
            <div className="h-60">
              <ScrollArea scrollFade className="h-full pt-grid-item-sm p-grid-item">
                {reposLoading
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
                  : reposError
                    ? (
                        <div className="flex h-full items-center justify-center text-destructive text-sm">
                          {tErrors('failedLoadRepos')}
                        </div>
                      )
                    : reposDataSet.length === 0
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
                            {reposDataSet.map((repo: RepoInfo) => (
                              <li key={repo.url}>
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
                              </li>
                            ))}
                          </ul>
                        )}
              </ScrollArea>
            </div>
          </StatCard>
        </div>

        {/* MARK: 顶级语言 */}
        <div className="col-span-7">
          <TopLanguagesCard
            icon={<SquareCodeIcon className="size-5" />}
            isLoading={reposLoading}
            items={topLanguages}
            title={t('topLanguages', { year: queryYear })}
          />
        </div>

        {/* MARK: 图表区域 - 月度提交 */}
        <div className="col-span-6">
          <MonthlyCommitChart
            calendars={contributionData?.contributionCalendars}
            isLoading={contributionLoading}
            year={queryYear}
          />
        </div>

        {/* MARK: 图表区域 - 周度提交 */}
        <div className="col-span-6">
          <WeeklyCommitChart
            calendars={contributionData?.contributionCalendars}
            isLoading={contributionLoading}
            year={queryYear}
          />
        </div>
      </div>
    </div>
  )
}
