import type { NextPage } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import ContributionsGraph from '../../components/ContributionsGraph'
import Layout from '../../components/Layout'
import type { ErrorData, GraphRemoteData, GraphSettings, GraphSize, Themes } from '../../types'

interface Props {
  username: string
  settings: GraphSettings
}

type NextPageWithLayout = NextPage<Props> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

const UserSharePage: NextPageWithLayout = ({ username, settings }: Props) => {
  const [graphData, setGraphData] = useState<GraphRemoteData>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (username) {
      void (async () => {
        try {
          setLoading(true)

          const res = await fetch(`/api/${username}`)

          if (res.status < 400) {
            const data: GraphRemoteData = await res.json()
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
        <Image priority alt="loading" height={60} src="/mona-loading-default.gif" width={60} />
        <span className="bg-white py-4 px-3">Loading Contributions...</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="py-10 md:py-14">
        <h1 className="text-lg font-medium md:mx-auto md:px-20 md:text-2xl md:leading-[1.2]">
          Just got my GitHub contribution graph by GreenWall,{' '}
          <Link href="/">
            <span className="cursor-pointer bg-gradient-to-br from-accent-500 to-accent-300/60 bg-clip-text text-transparent">
              generate yours!
            </span>
          </Link>
        </h1>

        <div className="flex w-full overflow-x-auto py-5 md:justify-center md:py-14">
          <ContributionsGraph
            className="md:shadow-2xl md:shadow-main-200"
            data={graphData}
            settings={settings}
          />
        </div>
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
