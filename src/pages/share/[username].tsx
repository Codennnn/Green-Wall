import { useEffect } from 'react'

import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import { DataProvider, useData } from '~/DataContext'
import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { Layout } from '~/components/Layout'
import type { DisplayName, GraphSettings, GraphSize, Themes } from '~/types'
import { useGraphRequest } from '~/useGraphRequest'

interface Props {
  username: string
  settings: GraphSettings
}

type NextPageWithLayout = NextPage<Props> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

const UserSharePage: NextPageWithLayout = ({ username, settings }: Props) => {
  const { graphData, setGraphData, dispatchSettings } = useData()

  const { run, loading, error } = useGraphRequest()

  useEffect(() => {
    dispatchSettings({ type: 'replace', payload: settings })
  }, [dispatchSettings, settings])

  useEffect(() => {
    if (username) {
      void (async () => {
        const data = await run({ username })
        setGraphData(data)
      })()
    }
  }, [username, run, setGraphData])

  const sharingTitle = `${username}'s GitHub contributions`
  const sharingURL = `https://green-wall.vercel.app/share/${username}`
  const sharingDescription = `I just made a GitHub contributions graph in review!`

  return (
    <>
      <Head>
        <title>{`${username}'s GitHub contributions in review · Green Wall`}</title>

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
          <span className="bg-white py-4 px-3">Loading contributions...</span>
        </div>
      ) : graphData ? (
        <div className="py-10 md:py-14">
          <h1 className="mb-5 text-center text-lg font-medium md:mx-auto md:px-20 md:text-3xl md:leading-[1.2]">
            Just got my GitHub contribution graph by GreenWall.
          </h1>

          <div className="flex justify-center">
            <Link href="/">
              <button
                className="cursor-pointer rounded-lg border-[3px] border-solid border-accent-400/70 bg-gradient-to-br from-accent-500 to-accent-300/60 bg-clip-text px-3 py-1 text-lg font-medium text-transparent outline-none transition-colors hover:border-accent-400 hover:bg-accent-400"
                type="button"
              >
                Generate Yours
              </button>
            </Link>
          </div>

          <div className="flex w-full overflow-x-auto py-5 md:justify-center md:py-14">
            <ContributionsGraph className="md:shadow-2xl md:shadow-main-200" />
          </div>
        </div>
      ) : error ? (
        <ErrorMessage errorType={error.errorType} text={error.message} />
      ) : null}
    </>
  )
}

UserSharePage.getInitialProps = ({ query }) => {
  const username = query.username as string

  const displayName =
    typeof query.displayName === 'string' ? (query.displayName as DisplayName) : undefined
  const yearRange = [
    Array.isArray(query.start) ? undefined : query.start,
    Array.isArray(query.end) ? undefined : query.end,
  ] as GraphSettings['yearRange']
  const size = typeof query.size === 'string' ? (query.size as GraphSize) : undefined
  const theme = typeof query.theme === 'string' ? (query.theme as Themes) : undefined

  return { username, settings: { displayName, yearRange, size, theme } }
}

UserSharePage.getLayout = (page: React.ReactElement) => {
  return (
    <Layout>
      <DataProvider key="share">{page}</DataProvider>
    </Layout>
  )
}

export default UserSharePage
