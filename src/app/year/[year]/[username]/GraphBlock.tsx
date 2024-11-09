import { useEffect, useState } from 'react'

import { useParams } from 'next/navigation'
import {
  ActivityIcon,
  ChartNoAxesCombinedIcon,
  FolderGit2Icon,
  LoaderIcon,
  MessageSquareQuoteIcon,
} from 'lucide-react'
import { safeParse } from 'valibot'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import { getLongestContributionStreak, getMaxContributionsInADay } from '~/helpers'
import {
  type IssuesInYear,
  IssuesInYearSchema,
  type RepoCreatedInYear,
  ReposCreatedInYearSchema,
} from '~/types'
import { useGraphRequest } from '~/useGraphRequest'

function StaticCardTitle(props: React.PropsWithChildren<{ icon: React.ReactNode }>) {
  const { children, icon } = props

  return (
    <span className="flex items-center gap-3">
      {icon}
      <span className="font-medium text-main-700">{children}</span>
    </span>
  )
}

function SpinningLoader() {
  return <LoaderIcon className="size-4 animate-spin text-main-500" />
}

type StaticCardProps = React.PropsWithChildren<Pick<React.ComponentProps<'div'>, 'className'>>

function StaticCard(props: StaticCardProps) {
  const { children, className = '' } = props

  return (
    <div
      className={`overflow-hidden rounded-[12px] border border-solid border-main-200 ${className}`}
    >
      <div className="rounded-[11px] border border-pageBg">
        <div className="rounded-[10px] border border-main-300">
          <div className="overflow-hidden rounded-[9px] border border-white/50">
            <div className="flex items-center gap-x-5 gap-y-2 bg-gradient-to-b from-main-100/80 to-main-100/5 p-3">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function GraphBlock() {
  const { year, username } = useParams()
  const queryYear = Number(year)
  const githubUsername = String(username)

  const { run, loading } = useGraphRequest()

  const [maxContributionStreak, setMaxContributionStreak] = useState<number>()
  const [maxContributionsInADay, setMaxContributionsInADay] = useState<number>()

  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [reposCreatedInYear, setReposCreatedInYear] = useState<RepoCreatedInYear>()
  const [issuesInYear, setIssuesInYear] = useState<IssuesInYear>()

  const { graphData, setGraphData } = useData()

  useEffect(() => {
    if (githubUsername) {
      void (async () => {
        fetch(`/api/repos?username=${githubUsername}&year=${queryYear}`).then(async (res) => {
          if (res.ok) {
            const repos = safeParse(ReposCreatedInYearSchema, await res.json())

            if (repos.success) {
              setReposCreatedInYear(repos.output)
              setLoadingRepos(false)
            }
          }
        })

        fetch(`/api/issues?username=${githubUsername}&year=${queryYear}`).then(async (res) => {
          if (res.ok) {
            const issues = safeParse(IssuesInYearSchema, await res.json())

            if (issues.success) {
              setIssuesInYear(issues.output)
              setLoadingIssues(false)
            }
          }
        })

        const data = await run({ username: githubUsername, years: [queryYear] })
        setGraphData(data)

        if (data) {
          const { maxStreak } = getLongestContributionStreak(data)
          setMaxContributionStreak(maxStreak)

          const { maxContributions } = getMaxContributionsInADay(data)
          setMaxContributionsInADay(maxContributions)
        }
      })()
    }
  }, [githubUsername, queryYear, run, setGraphData])

  return (
    <div className="flex flex-col items-center py-5">
      <Loading active={loading || !graphData}>
        {loading || !graphData ? (
          <div className="h-[265px] w-full" />
        ) : (
          <ContributionsGraph showInspect={false} titleRender={() => null} />
        )}
      </Loading>

      <>
        <div className="grid grid-cols-2 gap-3">
          <StaticCard>
            <StaticCardTitle icon={<ChartNoAxesCombinedIcon className="size-5" />}>
              Longest Streak
            </StaticCardTitle>
            <span className="ml-auto">
              {typeof maxContributionStreak === 'number' ? (
                maxContributionStreak
              ) : (
                <SpinningLoader />
              )}
            </span>
          </StaticCard>

          <StaticCard>
            <StaticCardTitle icon={<ActivityIcon className="size-5" />}>Top Record</StaticCardTitle>
            <span className="ml-auto">
              {typeof maxContributionsInADay === 'number' ? (
                maxContributionsInADay
              ) : (
                <SpinningLoader />
              )}
            </span>
          </StaticCard>

          <StaticCard>
            <StaticCardTitle icon={<FolderGit2Icon className="size-5" />}>
              Repos Created in {queryYear}
            </StaticCardTitle>
            <span className="ml-auto">
              {loadingRepos ? <SpinningLoader /> : reposCreatedInYear?.count}
            </span>
          </StaticCard>

          <StaticCard>
            <StaticCardTitle icon={<MessageSquareQuoteIcon className="size-5" />}>
              Issues in {queryYear}
            </StaticCardTitle>
            <span className="ml-auto">
              {loadingIssues ? <SpinningLoader /> : issuesInYear?.count}
            </span>
          </StaticCard>
        </div>
      </>
    </div>
  )
}
