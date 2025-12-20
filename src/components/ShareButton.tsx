import { useEffect, useState } from 'react'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowUpRightIcon, MousePointerClickIcon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover'
import { DEFAULT_SIZE, DEFAULT_THEME } from '~/constants'
import { useData } from '~/DataContext'
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard'
import { eventTracker } from '~/lib/analytics'

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
    <Popover
      onOpenChange={(open) => {
        if (open) {
          eventTracker.share.open()
        }
      }}
    >
      <PopoverTrigger
        render={(
          <Button variant="ghost">
            <MousePointerClickIcon />
            <span>{t('shareIt')}</span>
          </Button>
        )}
      />

      <PopoverContent>
        <div className="mb-2 flex items-center">
          <PopoverTitle className="flex-1">
            {t('title')}
          </PopoverTitle>

          <PopoverClose
            className="ml-auto"
            render={(
              <Button size="icon-sm" type="button" variant="ghost">
                <XIcon />
              </Button>
            )}
            title={tCommon('close')}
          />
        </div>
        <div className="max-w-[90vw] rounded-md pt-1 md:max-w-[min(40vw,300px)]">
          {shareUrl && (
            <div className="overflow-hidden rounded-md bg-muted p-2 text-xs text-muted-foreground md:text-sm">
              <div className="break-all">
                <span>{shareUrl.href.replace(shareUrl.search, '')}</span>
                <span className="opacity-70">{shareUrl.search}</span>
              </div>

              <div className="-mr-1 mt-4 flex items-center justify-end gap-x-2">
                <Link passHref className="h-full" href={shareUrl} target="_blank">
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={() => {
                      eventTracker.share.preview({
                        size: settings.size,
                        theme: settings.theme,
                        yearRange: settings.yearRange,
                        showSafariHeader: settings.showSafariHeader,
                        showAttribution: settings.showAttribution,
                      })
                    }}
                  >
                    <span>{tCommon('preview')}</span>
                    <ArrowUpRightIcon />
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (!copied) {
                      eventTracker.share.copy({
                        size: settings.size,
                        theme: settings.theme,
                        yearRange: settings.yearRange,
                        showSafariHeader: settings.showSafariHeader,
                        showAttribution: settings.showAttribution,
                      })
                      void copy(shareUrl.toString())
                    }
                  }}
                >
                  {copied ? tCommon('copied') : tCommon('copy')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
