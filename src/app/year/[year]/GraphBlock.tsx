import { useEffect, useState } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import { getLongestContributionStreak, getMaxContributionsInADay } from '~/helpers'
import { useGraphRequest } from '~/useGraphRequest'

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
              <div className="flex flex-1 items-center rounded bg-main-50 p-3">
                <span className="font-semibold">Longest Streak</span>
                <span className="ml-auto">{maxContributionStreak}</span>
              </div>

              <div className="flex flex-1 items-center rounded bg-main-50 px-4 py-3">
                <span className="font-semibold">Max Contributions in a Day</span>
                <span className="ml-auto">{maxContributionsInADay}</span>
              </div>
            </div>
          </>
        )}
      </Loading>
    </div>
  )
}
