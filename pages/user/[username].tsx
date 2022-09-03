import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import ContributionsGraph from '../../components/ContributionsGraph'
import Layout from '../../components/Layout'
import type { ErrorData, GraphData } from '../../types'

export default function UserSharePage() {
  const router = useRouter()
  const { username } = router.query

  const [graphData, setGraphData] = useState<GraphData>()

  useEffect(() => {
    if (username) {
      void (async () => {
        const res = await fetch(`/api/${username}`)
        console.log(res)
        if (res.status < 400) {
          const data: GraphData = await res.json()
          console.log(data)
          setGraphData(data)
        } else {
          const error: ErrorData = await res.json()
          console.log(error)
        }
      })()
    }
  }, [username])

  if (graphData) {
    return (
      <div className="flex w-full overflow-x-auto py-8 md:justify-center md:py-14">
        <ContributionsGraph data={graphData} />
      </div>
    )
  }

  return null
}

UserSharePage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}
