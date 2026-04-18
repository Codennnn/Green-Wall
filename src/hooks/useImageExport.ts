'use client'

import { type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import type * as HtmlToImage from 'html-to-image'

import { eventTracker } from '~/lib/analytics'
import type { GraphSettings } from '~/types'

interface UseImageExportOptions {
  filename?: string
}

type HtmlToImageModule = typeof HtmlToImage
type TimerId = ReturnType<typeof setTimeout>

const DEFAULT_EXPORT_CONTEXT = 'home'
const EXPORT_STATUS_RESET_DELAY = 2000

let htmlToImagePromise: Promise<HtmlToImageModule> | undefined

function loadHtmlToImage(): Promise<HtmlToImageModule> {
  htmlToImagePromise ??= import('html-to-image').catch((err: unknown) => {
    htmlToImagePromise = undefined

    throw err
  })

  return htmlToImagePromise
}

function clearTimer(timerRef: { current: TimerId | null }) {
  if (timerRef.current) {
    clearTimeout(timerRef.current)
    timerRef.current = null
  }
}

function isFirefoxBrowser(): boolean {
  if (typeof navigator === 'undefined') {
    return false
  }

  return navigator.userAgent.toLowerCase().includes('firefox')
}

export function useImageExport(
  graphRef: RefObject<HTMLDivElement | null>,
  username: string,
  settings: GraphSettings,
  options?: UseImageExportOptions & { context?: 'home' | 'year_report' },
) {
  const context = options?.context ?? DEFAULT_EXPORT_CONTEXT

  const [canUseClipboardItem, setCanUseClipboardItem] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const isMountedRef = useRef(false)
  const isDownloadingRef = useRef(false)
  const isCopyingRef = useRef(false)
  const downloadResetTimerRef = useRef<TimerId | null>(null)
  const copySuccessTimerRef = useRef<TimerId | null>(null)

  useEffect(() => {
    isMountedRef.current = true

    const clipboard = navigator.clipboard as Clipboard | undefined
    setCanUseClipboardItem(typeof ClipboardItem !== 'undefined' && typeof clipboard?.write === 'function')

    return () => {
      isMountedRef.current = false
      clearTimer(downloadResetTimerRef)
      clearTimer(copySuccessTimerRef)
    }
  }, [])

  const handleDownload = useEvent(async () => {
    const graphElement = graphRef.current

    if (!graphElement || !username || isDownloadingRef.current) {
      return
    }

    isDownloadingRef.current = true
    eventTracker.image.download.click(context, settings.size)

    try {
      if (isMountedRef.current) {
        setIsDownloading(true)
      }

      // Firefox 兼容性处理：跳过字体嵌入以避免 "font is undefined" 错误
      // @see https://github.com/bubkoo/html-to-image/issues/508
      const skipFonts = isFirefoxBrowser()
      const { toPng } = await loadHtmlToImage()
      const dataURL = await toPng(graphElement, { skipFonts })

      const trigger = document.createElement('a')
      trigger.href = dataURL
      trigger.download = options?.filename ?? `${username}_contributions`
      trigger.click()

      eventTracker.image.download.success(
        settings.size,
        settings.theme ?? 'unknown',
        settings.daysLabel ?? false,
        settings.showAttribution ?? false,
        context,
      )
    }
    catch (err) {
      if (err instanceof Error) {
        eventTracker.image.download.error(err.message, context)
      }

      console.error(err)
    }
    finally {
      if (isMountedRef.current) {
        clearTimer(downloadResetTimerRef)
        downloadResetTimerRef.current = setTimeout(() => {
          isDownloadingRef.current = false
          setIsDownloading(false)
          downloadResetTimerRef.current = null
        }, EXPORT_STATUS_RESET_DELAY)
      }
      else {
        isDownloadingRef.current = false
      }
    }
  })

  const handleCopyImage = useEvent(async () => {
    const graphElement = graphRef.current

    if (!graphElement || !username || !canUseClipboardItem || isCopyingRef.current) {
      return
    }

    isCopyingRef.current = true
    eventTracker.image.copy.click(context, settings.size)

    try {
      if (isMountedRef.current) {
        setIsCopying(true)
      }

      // Firefox 兼容性处理：跳过字体嵌入以避免 "font is undefined" 错误
      // @see https://github.com/bubkoo/html-to-image/issues/508
      const skipFonts = isFirefoxBrowser()

      const item = new ClipboardItem({
        'image/png': (async () => {
          // To be able to use `ClipboardItem` in safari, need to pass promise directly into it.
          // @see https://stackoverflow.com/questions/66312944/javascript-clipboard-api-write-does-not-work-in-safari
          const { toBlob } = await loadHtmlToImage()
          const blobData = await toBlob(graphElement, { skipFonts })

          if (!blobData) {
            throw new Error()
          }

          return blobData
        })(),
      })

      await navigator.clipboard.write([item])

      eventTracker.image.copy.success(
        settings.size,
        settings.theme ?? 'unknown',
        settings.daysLabel ?? false,
        context,
      )

      if (!isMountedRef.current) {
        return
      }

      setCopySuccess(true)

      clearTimer(copySuccessTimerRef)
      copySuccessTimerRef.current = setTimeout(() => {
        setCopySuccess(false)
        copySuccessTimerRef.current = null
      }, EXPORT_STATUS_RESET_DELAY)
    }
    catch (err) {
      if (err instanceof Error) {
        eventTracker.image.copy.error(err.message, context)
      }
    }
    finally {
      isCopyingRef.current = false

      if (isMountedRef.current) {
        setIsCopying(false)
      }
    }
  })

  return useMemo(
    () => ({
      canUseClipboardItem,
      isDownloading,
      isCopying,
      copySuccess,
      handleDownload,
      handleCopyImage,
    }),
    [
      canUseClipboardItem,
      isDownloading,
      isCopying,
      copySuccess,
      handleDownload,
      handleCopyImage,
    ],
  )
}
