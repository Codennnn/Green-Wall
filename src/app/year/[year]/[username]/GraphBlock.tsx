import { useEffect, useMemo } from 'react'

import { useParams } from 'next/navigation'
import {
  ActivityIcon,
  CalendarIcon,
  ChartNoAxesCombinedIcon,
  FolderGit2Icon,
  LoaderIcon,
  MessageSquareQuoteIcon,
  TrendingUpIcon,
} from 'lucide-react'

import { ContributionsGraph } from '~/components/ContributionsGraph'
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

function SpinningLoader() {
  return <LoaderIcon className="size-4 animate-spin text-main-300" />
}

interface StaticCardTitleProps {
  children: React.ReactNode
  icon: React.ReactNode
}

function StaticCardTitle(props: StaticCardTitleProps) {
  const { icon, children } = props

  return (
    <span className="flex items-center gap-x-3">
      {icon}
      <span className="font-medium">{children}</span>
    </span>
  )
}

interface StaticCardProps {
  children: React.ReactNode
}

function StaticCard(props: StaticCardProps) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-solid border-main-200 ">
      <div className="rounded-[11px] border border-page-background">
        <div className="rounded-[10px] border border-main-300">
          <div className="overflow-hidden rounded-[9px] border border-white/50">
            <div className="flex items-center gap-x-6 gap-y-2 bg-linear-to-b from-main-100/80 to-main-100/5 p-3">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatValueProps {
  value: number | string | undefined
  isLoading: boolean
  fallback?: number | string
}

/**
 * 统计数值显示组件
 * 根据加载状态显示加载图标或实际数值
 * @param value - 要显示的数值或文本
 * @param isLoading - 是否正在加载
 * @param fallback - 当 value 为 undefined 时的默认值,默认为 0
 */
function StatValue(props: StatValueProps) {
  const { value, isLoading, fallback = 0 } = props

  return (
    <span className="ml-auto tabular-nums">
      {
        isLoading
          ? <SpinningLoader />
          : (value ?? fallback)
      }
    </span>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  title: React.ReactNode
  value: number | string | undefined
  isLoading: boolean
  fallback?: number | string
}

/**
 * 完整的统计卡片组件
 * 封装了卡片容器、标题和数值显示的完整结构
 * @param icon - 卡片图标
 * @param title - 卡片标题
 * @param value - 统计数值或文本
 * @param isLoading - 是否正在加载
 * @param fallback - 默认值
 */
function StatCard(props: StatCardProps) {
  const { icon, title, value, isLoading, fallback } = props

  return (
    <StaticCard>
      <StaticCardTitle icon={icon}>
        {title}
      </StaticCardTitle>

      <StatValue
        fallback={fallback}
        isLoading={isLoading}
        value={value}
      />
    </StaticCard>
  )
}

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

  useEffect(() => {
    if (contributionData) {
      setGraphData(contributionData)
    }
  }, [contributionData, setGraphData])

  const isLoading = contributionLoading

  return (
    <div className="flex flex-col items-center py-5">
      <Loading active={isLoading}>
        {isLoading || !contributionData
          ? (
              <div className="h-[265px] w-full" />
            )
          : (
              <ContributionsGraph
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
          />

          <StatCard
            icon={<CalendarIcon className="size-5" />}
            isLoading={!statistics}
            title="Most Active Month"
            value={formatStatMonth(statistics?.maxContributionsMonth)}
          />

          <StatCard
            icon={<ChartNoAxesCombinedIcon className="size-5" />}
            isLoading={!statistics}
            title="Longest Streak"
            value={statistics?.longestStreak}
          />

          <StatCard
            icon={<ChartNoAxesCombinedIcon className="size-5" />}
            isLoading={!statistics}
            title="Longest Gap"
            value={statistics?.longestGap}
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
