import { useEffect, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'
import { LoaderIcon } from 'lucide-react'
import { array, number, object, parse, string } from 'valibot'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import { getLongestContributionStreak, getMaxContributionsInADay } from '~/helpers'
import type { IssuesInYear, RepoCreatedInYear } from '~/types'
import { useGraphRequest } from '~/useGraphRequest'

const ReposSchema = object({
  count: number(),
  repos: array(
    object({
      name: string(),
      createdAt: string(),
    })
  ),
})

const IssuesSchema = object({
  count: number(),
  issues: array(
    object({
      title: string(),
      createdAt: string(),
      repository: object({
        nameWithOwner: string(),
      }),
    })
  ),
})

type StaticCardProps = React.PropsWithChildren<Pick<React.ComponentProps<'div'>, 'className'>>

function SpinningLoader() {
  return <LoaderIcon className="size-4 animate-spin text-main-500" />
}

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
  const { year } = useParams()
  const searchParams = useSearchParams()
  const githubUsername = searchParams.get('username')
  const queryYear = Number(year)

  const { run, loading } = useGraphRequest()

  const [maxContributionStreak, setMaxContributionStreak] = useState<number>()
  const [maxContributionsInADay, setMaxContributionsInADay] = useState<number>()

  const [loadingRepos, setLoadingRepos] = useState(true)
  const [loadingIssues, setLoadingIssues] = useState(true)
  const [reposCreatedInYear, setReposCreatedInYear] = useState<RepoCreatedInYear>()
  const [issuesInYear, setIssuesInYear] = useState<IssuesInYear>()

  const { setGraphData } = useData()

  useEffect(() => {
    if (githubUsername) {
      void (async () => {
        fetch(`/api/repos?username=${githubUsername}&year=${queryYear}`).then(async (res) => {
          if (res.ok) {
            const repos = parse(ReposSchema, await res.json())
            setReposCreatedInYear(repos)
            setLoadingRepos(false)
          }
        })

        fetch(`/api/issues?username=${githubUsername}&year=${queryYear}`).then(async (res) => {
          if (res.ok) {
            const issues = parse(IssuesSchema, await res.json())
            setIssuesInYear(issues)
            setLoadingIssues(false)
          }
        })

        const data = await run({ username: githubUsername, years: [queryYear] })
        // const data = mockGraphData
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
      <Loading active={loading}>
        <ContributionsGraph showInspect={false} />

        <>
          <div className="grid grid-cols-2 gap-3">
            <StaticCard>
              <span className="font-semibold">Longest Streak</span>
              <span className="ml-auto">
                {typeof maxContributionStreak === 'number' ? (
                  maxContributionStreak
                ) : (
                  <SpinningLoader />
                )}
              </span>
            </StaticCard>

            <StaticCard>
              <span className="font-semibold">Max Contributions in a Day</span>
              <span className="ml-auto">
                {typeof maxContributionsInADay === 'number' ? (
                  maxContributionsInADay
                ) : (
                  <SpinningLoader />
                )}
              </span>
            </StaticCard>

            <StaticCard>
              <span className="font-semibold">Repos Created in {queryYear}</span>
              <span className="ml-auto">
                {loadingRepos ? <SpinningLoader /> : reposCreatedInYear?.count}
              </span>
            </StaticCard>

            <StaticCard>
              <span className="font-semibold">Issues in {queryYear}</span>
              <span className="ml-auto">
                {loadingIssues ? <SpinningLoader /> : issuesInYear?.count}
              </span>
            </StaticCard>
          </div>
        </>
      </Loading>
    </div>
  )
}
