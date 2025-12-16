import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AtSignIcon, DotIcon, UserIcon } from 'lucide-react'

import { useData } from '~/DataContext'
import { GraphSize } from '~/enums'
import { numberWithCommas } from '~/helpers'
import { cn } from '~/lib/utils'

const GitHubIcon = () => {
  return (
    <svg viewBox="0 0 24 24">
      <path
        clipRule="evenodd"
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
        fill="currentcolor"
        fillRule="evenodd"
      />
    </svg>
  )
}

const Avatar = () => {
  const { graphData } = useData()

  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    if (graphData?.avatarUrl) {
      setStatus('loading')
    }
    else {
      setStatus('loading')
    }
  }, [graphData?.avatarUrl])

  return (
    <span
      className="size-full overflow-hidden rounded-full bg-(--level-0)"
    >
      {graphData && status !== 'error' && (
        <img
          alt={`${graphData.login}'s avatar.`}
          className="h-full w-full"
          src={graphData.avatarUrl}
          onError={() => {
            setStatus('error')
          }}
          onLoad={() => {
            setStatus('loaded')
          }}
        />
      )}
      {status === 'error' && (
        <span className="inline-block size-full bg-linear-to-br from-(--level-1) to-(--level-2)" />
      )}
    </span>
  )
}

export function GraphHeader() {
  const t = useTranslations('graph')
  const { graphData, lastYear, totalYears, totalContributions, settings } = useData()

  if (!graphData) {
    return null
  }

  const username = graphData.login

  return (
    <div className="flex w-full items-center">
      <Link
        className="mr-4 flex shrink-0 items-center"
        href={`https://github.com/${username}`}
        target="_blank"
      >
        <span className="flex size-20 items-center">
          <Avatar />
        </span>
      </Link>

      <div className="flex basis-1/2 flex-col gap-1">
        <div>
          {!!graphData.name && (
            <span className="text-xl font-semibold" translate="no">
              {graphData.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-y-1 text-sm">
          <span className="flex items-center" translate="no">
            <AtSignIcon className="mr-px size-[13px]" />
            {graphData.login}
          </span>

          <DotIcon className="size-5" />

          <span className="flex items-center gap-1 whitespace-nowrap">
            <UserIcon className="size-4" />
            <span>{numberWithCommas(graphData.followers.totalCount)}</span>
            <span className="opacity-70">{t('followers')}</span>
          </span>

          <DotIcon className="size-5" />

          <span className="flex items-center gap-1 whitespace-nowrap">
            <span>{numberWithCommas(graphData.following.totalCount)}</span>
            <span className="opacity-70">{t('following')}</span>
          </span>
        </div>

        {!!graphData.bio && (
          <div
            className={cn(
              'line-clamp-3 text-sm opacity-70',
              settings.size === GraphSize.Small ? 'max-w-[300px]' : 'max-w-[400px]',
            )}
          >
            {graphData.bio}
          </div>
        )}
      </div>

      <div className="ml-auto flex shrink-0 flex-col items-end gap-0.5 text-xs">
        <Link className="pb-2" href={`https://github.com/${username}`} target="_blank">
          <span className="inline-block size-9">
            <GitHubIcon />
          </span>
        </Link>

        <span className="opacity-70">
          {typeof totalContributions === 'number'
            ? t('commits', { count: numberWithCommas(totalContributions) })
            : '-'}
        </span>

        <span className="opacity-70">
          {typeof totalYears === 'number'
            ? totalYears === 1
              ? t('inYear', { year: lastYear ?? '-' })
              : t('years', { count: totalYears })
            : '-'}
        </span>
      </div>
    </div>
  )
}
