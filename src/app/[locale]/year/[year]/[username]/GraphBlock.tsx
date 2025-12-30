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
import { StatCard, StatValue } from '~/components/StaticCard'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { useData } from '~/DataContext'
import { ReposCardMode } from '~/enums'
import { useDateFormatters } from '~/hooks/useDateFormatters'
import { useImageExport } from '~/hooks/useImageExport'
import { useContributionQuery,
  useIssuesQuery,
  useRepoInteractionsQuery,
  useReposQuery,
} from '~/hooks/useQueries'
import { getTopLanguagesFromRepos } from '~/lib/language-stats'
import { sortReposByDisplayValue, sortReposByInfluence } from '~/lib/repo-sort'
import { deriveStatistics } from '~/lib/statistics'
import { createTagTranslator } from '~/lib/yearly-report/createTagTranslator'
import {
  deriveYearlyTags,
  extractHighlights,
} from '~/lib/yearly-report/deriveTags'
import type { IssueInfo, RepoInteraction } from '~/types'

import { MonthlyCommitChart } from './charts/MonthlyCommitChart'
import { WeeklyCommitChart } from './charts/WeeklyCommitChart'
import { AiYearlyReportCard } from './AiYearlyReportCard'
import { ReposCard } from './ReposCard'
import { StatCardWithPopover } from './StatCardWithPopover'
import { TopLanguagesCard } from './TopLanguagesCard'

const STAT_CARD_ICON_SIZE = 'size-5'

export function GraphBlock() {
  const { year, username, locale } = useParams()
  const queryYear = Number(year)
  const githubUsername = String(username)
  const currentLocale = String(locale)
  const t = useTranslations('stats')
  const tErrors = useTranslations('errors')
  const tYearlyTags = useTranslations('yearlyTags')

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

  const [reposCardMode, setReposCardMode] = useState<ReposCardMode>(ReposCardMode.Interactions)

  const {
    data: repoInteractionsData,
    isLoading: repoInteractionsLoading,
    error: repoInteractionsErrorRaw,
  } = useRepoInteractionsQuery(
    githubUsername,
    queryYear,
    {
      enabled: reposCardMode === ReposCardMode.Interactions,
    },
  )
  // 类型断言：react-query 的 error 类型默认为 unknown，需要显式转换
  const repoInteractionsError: Error | null = repoInteractionsErrorRaw instanceof Error
    ? repoInteractionsErrorRaw
    : null

  const statistics = useMemo(() => deriveStatistics(contributionData), [contributionData])

  const repos = reposData?.repos

  const [reposDataSet, topLanguages] = useMemo(() => {
    return [
      Array.isArray(repos) ? repos : [],
      getTopLanguagesFromRepos(repos, { limit: 5 }),
    ]
  }, [repos])

  const [hiddenRepoUrls, setHiddenRepoUrls] = useState<Set<string>>(new Set())

  const handleRemoveRepo = useEvent((repoUrl: string) => {
    setHiddenRepoUrls((prev) => {
      const next = new Set(prev)

      next.add(repoUrl)

      return next
    })
  })

  const sortedReposDataSet = useMemo(() => {
    const sorted = sortReposByDisplayValue(reposDataSet)

    return sorted.filter((repo) => !hiddenRepoUrls.has(repo.url))
  }, [reposDataSet, hiddenRepoUrls])

  const sortedInteractionRepos = useMemo((): RepoInteraction[] => {
    const data = repoInteractionsData
    const repos = data?.repos ?? []
    const sorted = sortReposByInfluence(repos)

    return sorted.filter((repo) => !hiddenRepoUrls.has(repo.url))
  }, [repoInteractionsData, hiddenRepoUrls])

  const handleReposCardModeChange = useEvent((mode: ReposCardMode) => {
    setReposCardMode(mode)
  })

  const tagTranslator = useMemo(() => {
    return createTagTranslator(tYearlyTags)
  }, [tYearlyTags])

  // 年度报告标签推导
  const yearlyTags = useMemo(() => {
    return deriveYearlyTags({
      statistics,
      calendars: contributionData?.contributionCalendars,
      topLanguages,
      reposData,
      issuesData,
      translator: tagTranslator,
    })
  }, [
    statistics,
    contributionData?.contributionCalendars,
    topLanguages,
    reposData,
    issuesData,
    tagTranslator,
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
    {},
    { filename: `${githubUsername}_${queryYear}_yearly_report`, context: 'year_report' },
  )

  const handleDownloadClick = useEvent(() => {
    void handleDownload()
  })

  const handleClearHighlight = useEvent(() => {
    setHighlightMode('none')
    setHighlightOptions(undefined)
  })

  return (
    <div className="flex flex-col items-center py-5 w-full">
      <div className="flex items-center w-full p-grid-item">
        <div className="ml-auto flex justify-end ring-4 ring-background bg-background">
          <Button
            disabled={isDownloading || isLoading}
            size="default"
            onClick={handleDownloadClick}
          >
            <DownloadIcon />
            {t('downloadYearlyReport')}
          </Button>
        </div>
      </div>

      <div
        ref={reportContainerRef}
        className="grid w-full grid-cols-1 gap-4 bg-background p-grid-item md:grid-cols-8 lg:grid-cols-12"
      >
        {/* MARK: 贡献日历热力图 */}
        <div className="col-span-1 md:col-span-5 lg:col-span-7">
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
        <div className="col-span-1 md:col-span-3 lg:col-span-5">
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
        <div className="col-span-1 md:col-span-4 lg:col-span-4">
          <StatCard
            icon={<CalendarArrowUpIcon className={STAT_CARD_ICON_SIZE} />}
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
        <div className="col-span-1 md:col-span-4 lg:col-span-4">
          <StatCard
            icon={<ScaleIcon className={STAT_CARD_ICON_SIZE} />}
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
          className="col-span-1 md:col-span-4 lg:col-span-4"
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
            icon={<MessageSquareQuoteIcon className={STAT_CARD_ICON_SIZE} />}
            statValueProps={{
              isLoading: issuesLoading,
              value: issuesData?.count,
            }}
            title={t('issues', { year: queryYear })}
          />
        </StatCardWithPopover>

        {/* MARK: 最大贡献 */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-2">
          <StatCard
            icon={<ArrowBigUpDashIcon className={STAT_CARD_ICON_SIZE} />}
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
                unit={t('unitContributions')}
                value={statistics?.maxContributionsInADay}
              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 最长连续天数 */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-2">
          <StatCard
            icon={<CalendarDaysIcon className={STAT_CARD_ICON_SIZE} />}
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
                unit={t('unitDays')}
                value={statistics?.longestStreak}

              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 最长间隔天数 */}
        <div className="col-span-1 md:col-span-4 lg:col-span-4 lg:row-span-2">
          <StatCard
            icon={<CalendarMinus2Icon className={STAT_CARD_ICON_SIZE} />}
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
                unit={t('unitDays')}
                value={statistics?.longestGap}
              />
            </div>
          </StatCard>
        </div>

        {/* MARK: 仓库数量 */}
        <div className="col-span-1 md:col-span-8 lg:col-span-5">
          <ReposCard
            createdError={reposError}
            createdLoading={reposLoading}
            createdRepos={sortedReposDataSet}
            icon={<FolderGit2Icon className={STAT_CARD_ICON_SIZE} />}
            interactionError={repoInteractionsError}
            interactionLoading={repoInteractionsLoading}
            interactionRepos={sortedInteractionRepos}
            mode={reposCardMode}
            title={t('repos', { year: queryYear })}
            onModeChange={handleReposCardModeChange}
            onRemoveRepo={handleRemoveRepo}
          />
        </div>

        {/* MARK: 顶级语言 */}
        <div className="col-span-1 md:col-span-8 lg:col-span-7">
          <TopLanguagesCard
            icon={<SquareCodeIcon className={STAT_CARD_ICON_SIZE} />}
            isLoading={reposLoading}
            items={topLanguages}
            title={t('topLanguages', { year: queryYear })}
          />
        </div>

        {/* MARK: 图表区域 - 月度提交 */}
        <div className="col-span-1 md:col-span-4 lg:col-span-6">
          <MonthlyCommitChart
            calendars={contributionData?.contributionCalendars}
            isLoading={contributionLoading}
            year={queryYear}
          />
        </div>

        {/* MARK: 图表区域 - 周度提交 */}
        <div className="col-span-1 md:col-span-4 lg:col-span-6">
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
