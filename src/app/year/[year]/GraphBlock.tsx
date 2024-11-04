import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import { useData } from '~/DataContext'
import { useGraphRequest } from '~/useGraphRequest'

export function GraphBlock() {
  const { year } = useParams()
  const searchParams = useSearchParams()

  const githubUsername = searchParams.get('username')

  const { run } = useGraphRequest()

  const { setGraphData } = useData()

  useEffect(() => {
    if (githubUsername && typeof year === 'string') {
      void (async () => {
        const data = await run({ username: githubUsername, years: [Number(year)] })
        setGraphData(data)
      })()
    }
  }, [year, githubUsername, run, setGraphData])

  return <ContributionsGraph />
}
