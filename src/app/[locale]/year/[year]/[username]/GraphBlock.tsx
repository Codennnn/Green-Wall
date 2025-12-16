import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  ArrowBigUpDashIcon,
  Calendar1Icon,
  CalendarArrowUpIcon,
  CalendarDaysIcon,
  CalendarMinus2Icon,
  DownloadIcon,
  FolderGit2Icon,
  MessageSquareQuoteIcon,
  ScaleIcon,
  SquareCodeIcon,
} from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import type { GraphHighlightMode, GraphHighlightOptions } from '~/components/ContributionsGraph/graphHighlightUtils'
import Loading from '~/components/Loading'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
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
import { SpinningLoader, StatCard, StaticCard, StaticCardTitle } from './StaticCard'
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
  const topLanguages = useMemo(() => {
    return getTopLanguagesFromRepos(reposData?.repos, { limit: 5 })
  }, [reposData?.repos])

  // 年度报告标签推导
  const yearlyTags = useMemo(() => {
    return deriveYearlyTags({
      statistics,
      calendars: contributionData?.contributionCalendars,
      topLanguages,
      reposData,
      issuesData,
    })
  }, [statistics, contributionData?.contributionCalendars, topLanguages, reposData, issuesData])

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

      <div ref={reportContainerRef} className="grid w-full grid-cols-12 gap-4 bg-background p-4">
        {/* MARK: 贡献日历热力图 */}
        <div className="col-span-7">
          <Loading active={isLoading}>
            {isLoading || !contributionData
              ? (
                  <div className="h-[265px] w-full" />
                )
              : (
                  <ContributionsGraph
                    highlightMode={highlightMode}
                    highlightOptions={highlightOptions}
                    mockupWrapperClassName="p-grid-item"
                    showInspect={false}
                    titleRender={() => null}
                  />
                )}
          </Loading>
        </div>

        {/* MARK: AI 年度报告 */}
        {!!statistics && (
          <div className="col-span-5">
            <AiYearlyReportCard
              highlights={yearlyHighlights}
              locale={currentLocale}
              tags={yearlyTags}
              username={githubUsername}
              year={queryYear}
            />
          </div>
        )}

        {/* MARK: 最大贡献 */}
        <StatCard
          className="col-span-4"
          icon={<ArrowBigUpDashIcon className="size-5" />}
          isLoading={!statistics}
          title={t('maxContributions')}
          value={statistics?.maxContributionsInADay}
          onMouseEnter={() => {
            if (statistics?.maxContributionsDate) {
              setHighlightMode('specificDate')
              setHighlightOptions({ specificDate: statistics.maxContributionsDate })
            }
          }}
          onMouseLeave={handleClearHighlight}
        />

        {/* MARK: 最活跃日期 */}
        <StatCard
          className="col-span-4"
          icon={<Calendar1Icon className="size-5" />}
          isLoading={!statistics}
          title={t('mostActiveDay')}
          value={formatDate(statistics?.maxContributionsDate)}
          onMouseEnter={() => {
            if (statistics?.maxContributionsDate) {
              setHighlightMode('specificDate')
              setHighlightOptions({ specificDate: statistics.maxContributionsDate })
            }
          }}
          onMouseLeave={handleClearHighlight}
        />

        {/* MARK: 最活跃月份 */}
        <StatCard
          className="col-span-4"
          icon={<CalendarArrowUpIcon className="size-5" />}
          isLoading={!statistics}
          title={t('mostActiveMonth')}
          value={formatMonth(statistics?.maxContributionsMonth)}
          onMouseEnter={() => {
            if (statistics?.maxContributionsMonth) {
              setHighlightMode('specificMonth')
              setHighlightOptions({ specificMonth: statistics.maxContributionsMonth })
            }
          }}
          onMouseLeave={handleClearHighlight}
        />

        {/* MARK: 平均每日 */}
        <StatCard
          className="col-span-4"
          icon={<ScaleIcon className="size-5" />}
          isLoading={!statistics}
          title={t('averagePerDay')}
          value={statistics?.averageContributionsPerDay}
        />

        {/* MARK: 最长连续天数 */}
        <StatCard
          large
          className="col-span-4 row-span-2"
          contentClassName="flex-col items-start justify-center gap-3 py-6"
          icon={<CalendarDaysIcon className="size-6" />}
          isLoading={!statistics}
          subValue={formatDateRange(
            statistics?.longestStreakStartDate,
            statistics?.longestStreakEndDate,
          )}
          title={t('longestStreak')}
          value={statistics?.longestStreak}
          onMouseEnter={() => {
            if (statistics?.longestStreakStartDate && statistics.longestStreakEndDate) {
              setHighlightMode('longestStreak')
              setHighlightOptions(undefined)
            }
          }}
          onMouseLeave={handleClearHighlight}
        />

        {/* MARK: 最长间隔天数 */}
        <StatCard
          large
          className="col-span-4 row-span-2"
          contentClassName="flex-col items-start justify-center gap-3 py-6"
          icon={<CalendarMinus2Icon className="size-6" />}
          isLoading={!statistics}
          subValue={formatDateRange(
            statistics?.longestGapStartDate,
            statistics?.longestGapEndDate,
          )}
          title={t('longestGap')}
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
          loadingMessage={tErrors('loadingIssues')}
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
            isLoading={issuesLoading}
            title={t('issues', { year: queryYear })}
            value={issuesData?.count}
          />
        </StatCardWithPopover>

        {/* MARK: 仓库数量 */}
        <div className="col-span-5">
          <StaticCard contentClassName="flex-col items-stretch gap-3 py-4">
            <div className="flex items-center gap-x-3">
              <StaticCardTitle icon={<FolderGit2Icon className="size-5" />}>
                {t('reposCreated', { year: queryYear })}
              </StaticCardTitle>
              <span className="ml-auto tabular-nums">
                {reposLoading
                  ? <SpinningLoader />
                  : (reposData?.count ?? 0)}
              </span>
            </div>

            <div className="h-32">
              {reposLoading
                ? (
                    <div className="flex h-full items-center justify-center text-foreground/70 text-sm">
                      <div className="size-4 animate-spin rounded-full border-2 border-border border-t-transparent" />
                      <span className="ml-2">{tErrors('loadingRepos')}</span>
                    </div>
                  )
                : reposError
                  ? (
                      <div className="flex h-full items-center justify-center text-destructive text-sm">
                        {tErrors('failedLoadRepos')}
                      </div>
                    )
                  : (reposData?.repos ?? []).length === 0
                      ? (
                          <div className="flex h-full items-center justify-center text-foreground/70 text-sm">
                            {tErrors('noRepos')}
                          </div>
                        )
                      : (
                          <ScrollArea scrollFade className="h-full">
                            <ul className="flex flex-col gap-1 pr-1">
                              {(reposData?.repos ?? []).map((repo: RepoInfo) => (
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
                          </ScrollArea>
                        )}
            </div>
          </StaticCard>
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
