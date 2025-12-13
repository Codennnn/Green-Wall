import { useEffect, useMemo, useState } from 'react'

import { useParams } from 'next/navigation'
import {
  ActivityIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  FolderGit2Icon,
  MessageSquareQuoteIcon,
  TrendingUpIcon,
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
import {
  deriveStatistics,
  formatStatDate,
  formatStatMonth,
} from '~/lib/statistics'

import { StatCard } from './StaticCard'

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

  const { data: reposData, isLoading: reposLoading } = useReposQuery(
    githubUsername,
    queryYear,
  )

  const { data: issuesData, isLoading: issuesLoading } = useIssuesQuery(
    githubUsername,
    queryYear,
  )

  const statistics = useMemo(() => deriveStatistics(contributionData), [contributionData])

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
    let range: string | undefined = undefined

    if (startDate && endDate) {
      range = `${formatStatDate(startDate)} - ${formatStatDate(endDate)}`
    }

    return range
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
            icon={<ActivityIcon className="size-5" />}
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
            icon={<TrendingUpIcon className="size-5" />}
            isLoading={!statistics}
            title="Average Per Day"
            value={statistics?.averageContributionsPerDay}
          />

          <StatCard
            icon={<CalendarIcon className="size-5" />}
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
            icon={<CalendarIcon className="size-5" />}
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
            icon={<ChartNoAxesCombinedIcon className="size-5" />}
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
            icon={<ChartNoAxesCombinedIcon className="size-5" />}
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

          <StatCard
            icon={<FolderGit2Icon className="size-5" />}
            isLoading={reposLoading}
            title={`Repos Created in ${queryYear}`}
            value={reposData?.count}
          />

          <StatCard
            icon={<MessageSquareQuoteIcon className="size-5" />}
            isLoading={issuesLoading}
            title={`Issues in ${queryYear}`}
            value={issuesData?.count}
          />
        </div>
      </>
    </div>
  )
}
