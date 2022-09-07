import type { NextPage } from 'next'
import Image from 'next/image'
import { useEffect, useState } from 'react'

import ContributionsGraph from '../../components/ContributionsGraph'
import Layout from '../../components/Layout'
import type { ErrorData, GraphData, GraphSettings, GraphSize, Themes } from '../../types'

interface Props {
  username: string
  settings: GraphSettings
}

type NextPageWithLayout = NextPage<Props> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

const UserSharePage: NextPageWithLayout = ({ username, settings }: Props) => {
  const [graphData, setGraphData] = useState<GraphData>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      void (async () => {
        try {
          setLoading(true)

          const res = await fetch(`/api/${username}`)

          if (res.status < 400) {
            const data: GraphData = await res.json()
            setGraphData(data)
          } else {
            const error: ErrorData = await res.json()
            console.log(error)
          }
        } finally {
          setLoading(false)
        }
      })()
    }
  }, [username])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main-400">
        <Image priority height={60} src="/mona-loading-default.gif" width={60} />
        <span className="bg-white py-4 px-3">Loading Contributions...</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="flex w-full overflow-x-auto py-8 md:justify-center md:py-14">
        <ContributionsGraph
          className="shadow-2xl shadow-main-200"
          data={graphData}
          settings={settings}
        />
      </div>
    )
  }

  return null
}

UserSharePage.getInitialProps = ({ query }) => {
  const username = query.username as string

  const size = typeof query.size === 'string' ? (query.size as GraphSize) : undefined
  const theme = typeof query.theme === 'string' ? (query.theme as Themes) : undefined

  return { username, settings: { size, theme } }
}

UserSharePage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}

export default UserSharePage
