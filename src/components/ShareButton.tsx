import { useEffect, useState } from 'react'

import Link from 'next/link'
import { ArrowUpRightIcon, MousePointerClickIcon } from 'lucide-react'

import { DEFAULT_DISPLAY_NAME, DEFAULT_SIZE, DEFAULT_THEME } from '~/constants'
import { useData } from '~/DataContext'
import { trackEvent } from '~/helpers'

import { RadixPopover } from './ui-kit/RadixPopover'

export function ShareButton() {
  const { graphData, settings, firstYear, lastYear } = useData()
  const username = graphData?.login

  const [shareUrl, setShareUrl] = useState<URL>()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (username) {
      const Url = new URL(`${window.location.origin}/share/${username}`)

      if (settings.displayName && settings.displayName !== DEFAULT_DISPLAY_NAME) {
        Url.searchParams.set('displayName', settings.displayName)
      }
      if (Array.isArray(settings.yearRange)) {
        const [startYear, endYear] = settings.yearRange
        if (startYear && startYear !== firstYear) {
          Url.searchParams.set('start', startYear)
        }
        if (endYear && endYear !== lastYear) {
          Url.searchParams.set('end', endYear)
        }
      }
      if (settings.size && settings.size !== DEFAULT_SIZE) {
        Url.searchParams.set('size', settings.size)
      }
      if (settings.theme && settings.theme !== DEFAULT_THEME) {
        Url.searchParams.set('theme', settings.theme)
      }

      setShareUrl(Url)
    }
  }, [username, settings, firstYear, lastYear])

  return (
    <RadixPopover
      content={
        <div className="max-w-[90vw] rounded-md pt-2 md:max-w-[min(40vw,300px)]">
          {shareUrl && (
            <div className="overflow-hidden rounded bg-main-100/80 p-3 pb-2 text-xs text-main-500 md:text-sm">
              <div className="break-all">
                <span>{shareUrl.href.replace(shareUrl.search, '')}</span>
                <span className="opacity-60">{shareUrl.search}</span>
              </div>

              <div className="-mr-1 mt-4 flex h-7 items-center justify-end gap-x-2">
                <Link passHref className="h-full" href={shareUrl} target="_blank">
                  <button
                    className="flex h-full items-center gap-x-1 rounded bg-main-200 px-2"
                    onClick={() => {
                      trackEvent('Preview Share URL')
                    }}
                  >
                    <span>Preview</span>
                    <ArrowUpRightIcon className="size-4 translate-y-px" />
                  </button>
                </Link>
                <button
                  className="inline-block h-full min-w-14 rounded bg-accent-100 px-1 text-accent-600"
                  onClick={() => {
                    if (!copied) {
                      trackEvent('Copy Share URL')

                      void navigator.clipboard.writeText(shareUrl.toString()).then(() => {
                        setCopied(true)
                        setTimeout(() => {
                          setCopied(false)
                        }, 1500)
                      })
                    }
                  }}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      }
      title="Share Your Graph"
    >
      <button className="simple-button divider">
        <MousePointerClickIcon className="size-5" />
        <span>Share it</span>
      </button>
    </RadixPopover>
  )
}
