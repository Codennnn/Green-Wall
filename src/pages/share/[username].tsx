import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
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

          const res = await fetch(`/api/contribution/${username}`)

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

  const sharingTitle = `${username}'s GitHub contributions`
  const sharingURL = `https://green-wall.vercel.app/share/${username}`
  const sharingDescription = `I just made a GitHub contributions graph in review!`

  return (
    <>
      <Head>
        <title>
          {username}
          {`'`}s GitHub contributions in review · Green Wall
        </title>

        <meta content={sharingTitle} property="og:title" />
        <meta content={sharingDescription} property="og:description" />
        <meta content={sharingURL} property="og:url" />

        <meta content={sharingTitle} name="twitter:title" />
        <meta content={sharingDescription} name="twitter:description" />
        <meta content={sharingURL} property="twitter:url" />
      </Head>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-main-400">
          <Image priority alt="loading" height={60} src="/mona-loading-default.gif" width={60} />
          <span className="bg-white py-4 px-3">Loading Contributions...</span>
        </div>
      ) : graphData ? (
        <div className="py-10 md:py-14">
          <h1 className="text-center text-lg font-medium md:mx-auto md:px-20 md:text-3xl md:leading-[1.2]">
            <div className="mb-2">Just got my GitHub contribution graph by GreenWall.</div>
            <Link href="/">
              <span className="cursor-pointer bg-gradient-to-br from-accent-500 to-accent-300/60 bg-clip-text text-transparent">
                Generate Yours!
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
      ) : null}
    </>
  )

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
