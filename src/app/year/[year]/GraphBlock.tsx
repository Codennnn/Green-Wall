import { useEffect, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import { getLongestContributionStreak, getMaxContributionsInADay } from '~/helpers'
import { mockGraphData } from '~/mock-data'
import { useGraphRequest } from '~/useGraphRequest'

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
  const { year } = useParams()
  const searchParams = useSearchParams()
  const githubUsername = searchParams.get('username')

  const { run, loading } = useGraphRequest()

  const [maxContributionStreak, setMaxContributionStreak] = useState<number>()
  const [maxContributionsInADay, setMaxContributionsInADay] = useState<number>()

  const { graphData, setGraphData } = useData()

  useEffect(() => {
    if (githubUsername && typeof year === 'string') {
      void (async () => {
        const data = await run({ username: githubUsername, years: [Number(year)] })
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
  }, [year, githubUsername, run, setGraphData])

  return (
    <div className="flex flex-col items-center py-5">
      <Loading active={loading}>
        <ContributionsGraph showInspect={false} />

        {!!graphData && (
          <>
            <div className="flex flex-wrap items-center gap-3">
              <StaticCard className="flex-1">
                <span className="font-semibold">Longest Streak</span>
                <span className="ml-auto">{maxContributionStreak}</span>
              </StaticCard>

              <StaticCard className="flex-1">
                <span className="font-semibold">Max Contributions in a Day</span>
                <span className="ml-auto">{maxContributionsInADay}</span>
              </StaticCard>
            </div>
          </>
        )}
      </Loading>
    </div>
  )
}
