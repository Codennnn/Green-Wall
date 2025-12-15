'use client'

import { useEffect, useMemo } from 'react'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { DEFAULT_THEME, THEME_PRESETS } from '~/constants'
import { useData } from '~/DataContext'
import type { GraphSize } from '~/enums'
import { useContributionQuery } from '~/hooks/useQueries'
import type { GraphSettings, Themes } from '~/types'

export function SharePage() {
  const t = useTranslations('share')
  const tGraph = useTranslations('graph')
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

  const { setGraphData, dispatchSettings } = useData()

  useEffect(() => {
    if (settings) {
      dispatchSettings({ type: 'replace', payload: settings })
    }
  }, [dispatchSettings, settings])

  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : ''

  const {
    data: graphData,
    isLoading: loading,
    error,
    isError,
  } = useContributionQuery(username, undefined, false, {
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 分钟
    gcTime: 60 * 60 * 1000, // 1 小时
  })

  useEffect(() => {
    if (graphData) {
      setGraphData(graphData)
    }
  }, [graphData, setGraphData])

  // 构造错误对象以兼容现有接口
  const errorData
    = isError
      ? {
          errorType: error.errorType,
          message: error.message,
        }
      : undefined

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main-400">
        <Image
          priority
          alt="loading"
          height={60}
          src="/mona-loading-default.gif"
          width={60}
        />
        <span className="bg-background px-3 py-4">{tGraph('loadingContributions')}</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="py-10 md:py-14">
        <h1 className="mb-5 text-center text-lg font-medium md:mx-auto md:px-20 md:text-3xl md:leading-[1.2]">
          {t('headline')}
          <br />
          {t('cta')}
          {' '}
          🌱
        </h1>

        <div className="flex justify-center">
          <Link href="/">
            <button
              className="cursor-pointer rounded-lg border-[3px] border-solid border-brand-400/70 bg-linear-to-br from-brand-500 to-brand-300/60 bg-clip-text px-3 py-1 text-lg font-medium text-transparent outline-none transition-colors hover:border-brand-400 hover:bg-brand-400"
              type="button"
            >
              {t('generateYours')}
            </button>
          </Link>
        </div>

        <div className="flex w-full overflow-x-auto py-5 md:justify-center md:py-14">
          <ContributionsGraph />
        </div>
      </div>
    )
  }

  if (errorData) {
    return (
      <ErrorMessage errorType={errorData.errorType} text={errorData.message} />
    )
  }

  return null
}
