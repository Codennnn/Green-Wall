'use client'

import { useEffect, useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { DEFAULT_THEME, THEME_PRESETS } from '~/constants'
import { useData } from '~/DataContext'
import type { GraphSize } from '~/enums'
import type { GraphSettings, Themes } from '~/types'
import { useGraphRequest } from '~/useGraphRequest'

export function SharePage() {
  const query = useSearchParams()

  const settings = useMemo<GraphSettings | null>(() => {
    const start = query.get('start') ?? undefined
    const end = query.get('end') ?? undefined
    const size = query.get('size') ?? undefined
    let theme = query.get('theme') ?? undefined
    theme = THEME_PRESETS.some((t) => t.name === theme) ? theme : DEFAULT_THEME

    // default values
    // only be hidden when the query is explicitly specified as 'false'
    const showSafariHeader = query.get('showSafariHeader') !== 'false'
    const showAttribution = query.get('showAttribution') !== 'false'

    return {
      yearRange: [start, end] as GraphSettings['yearRange'],
      size: size as GraphSize | undefined,
      theme: theme as Themes | undefined,
      showSafariHeader,
      showAttribution,
    }
  }, [query])

  const { graphData, setGraphData, dispatchSettings } = useData()

  const { run, loading, error } = useGraphRequest()

  useEffect(() => {
    if (settings) {
      dispatchSettings({ type: 'replace', payload: settings })
    }
  }, [dispatchSettings, settings])

  const params = useParams()
  const username = typeof params['username'] === 'string' ? params['username'] : undefined

  useEffect(() => {
    if (username) {
      void (async () => {
        const data = await run({ username })
        setGraphData(data)
      })()
    }
  }, [username, run, setGraphData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main-400">
        <Image priority alt="loading" height={60} src="/mona-loading-default.gif" width={60} />
        <span className="bg-pageBg px-3 py-4">Loading contributions...</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="py-10 md:py-14">
        <h1 className="mb-5 text-center text-lg font-medium md:mx-auto md:px-20 md:text-3xl md:leading-[1.2]">
          Generated my GitHub graph with GreenWall
          <br />
          Try it and share yours! 🌱
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
          <ContributionsGraph />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorMessage errorType={error.errorType} text={error.message} />
  }

  return null
}
