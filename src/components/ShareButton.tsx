import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowUpRightIcon, MousePointerClickIcon, XIcon } from 'lucide-react'

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover'
import { DEFAULT_SIZE, DEFAULT_THEME } from '~/constants'
import { useData } from '~/DataContext'
import { trackEvent } from '~/helpers'
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard'

export function ShareButton() {
  const t = useTranslations('share')
  const tCommon = useTranslations('common')
  const { graphData, settings, firstYear, lastYear } = useData()
  const username = graphData?.login

  const [shareUrl, setShareUrl] = useState<URL>()
  const { copied, copy } = useCopyToClipboard({ resetDelay: 1500 })

  useEffect(() => {
    if (username) {
      const Url = new URL(`${window.location.origin}/share/${username}`)

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

      if (settings.showSafariHeader === false) {
        Url.searchParams.set('showSafariHeader', 'false')
      }

      if (settings.showAttribution === false) {
        Url.searchParams.set('showAttribution', 'false')
      }

      setShareUrl(Url)
    }
  }, [username, settings, firstYear, lastYear])

  return (
    <Popover>
      <PopoverTrigger className="simple-button divider">
        <MousePointerClickIcon className="size-5" />
        <span>{t('shareIt')}</span>
      </PopoverTrigger>
      <PopoverContent>
        <div className="mb-2 flex items-center">
          <PopoverTitle className="min-h-[24px] flex-1 font-medium text-main-500">
            {t('title')}
          </PopoverTitle>
          <PopoverClose className="ml-auto" title={tCommon('close')}>
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <XIcon className="size-4 text-main-500" />
            </span>
          </PopoverClose>
        </div>
        <div className="max-w-[90vw] rounded-md pt-2 md:max-w-[min(40vw,300px)]">
          {shareUrl && (
            <div className="overflow-hidden rounded-md bg-main-100/80 p-3 pb-2 text-xs text-main-500 md:text-sm">
              <div className="break-all">
                <span>{shareUrl.href.replace(shareUrl.search, '')}</span>
                <span className="opacity-60">{shareUrl.search}</span>
              </div>

              <div className="-mr-1 mt-4 flex h-7 items-center justify-end gap-x-2">
                <Link passHref className="h-full" href={shareUrl} target="_blank">
                  <button
                    className="flex h-full items-center gap-x-1 rounded-md bg-main-200 px-2"
                    onClick={() => {
                      trackEvent('Preview Share URL')
                    }}
                  >
                    <span>{tCommon('preview')}</span>
                    <ArrowUpRightIcon className="size-4 translate-y-px" />
                  </button>
                </Link>
                <button
                  className="inline-block h-full min-w-14 rounded-md bg-brand-100 px-1 text-brand-600"
                  onClick={() => {
                    if (!copied) {
                      trackEvent('Copy Share URL')
                      void copy(shareUrl.toString())
                    }
                  }}
                >
                  {copied ? tCommon('copied') : tCommon('copy')}
                </button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
