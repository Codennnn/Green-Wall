import { useEffect } from 'react'

import { useParams, useSearchParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import Loading from '~/components/Loading'
import { useData } from '~/DataContext'
import { useGraphRequest } from '~/useGraphRequest'

export function GraphBlock() {
  const { year } = useParams()
  const searchParams = useSearchParams()

  const githubUsername = searchParams.get('username')

  const { run, loading } = useGraphRequest()

  const { setGraphData } = useData()

  useEffect(() => {
    if (githubUsername && typeof year === 'string') {
      void (async () => {
        const data = await run({ username: githubUsername, years: [Number(year)] })
        setGraphData(data)
      })()
    }
  }, [year, githubUsername, run, setGraphData])

  return (
    <div className="flex flex-col items-center py-5">
      <Loading active={loading}>
        <ContributionsGraph showInspect={false} />
      </Loading>
    </div>
  )
}
