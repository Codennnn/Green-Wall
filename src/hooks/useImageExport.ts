'use client'

import { type RefObject, useState } from 'react'

import { toBlob, toPng } from 'html-to-image'

import { trackEvent } from '~/helpers'

export function useImageExport(
  graphRef: RefObject<HTMLDivElement | null>,
  username: string,
) {
  const canUseClipboardItem = typeof ClipboardItem !== 'undefined'

  const [isDownloading, setIsDownloading] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleDownload = async () => {
    if (graphRef.current && username && !isDownloading) {
      try {
        setIsDownloading(true)
        trackEvent('Click Download')

        const dataURL = await toPng(graphRef.current)
        const trigger = document.createElement('a')
        trigger.href = dataURL
        trigger.download = `${username}_contributions`
        trigger.click()
      }
      catch (err) {
        if (err instanceof Error) {
          trackEvent('Error: Download Image', { msg: err.message })
        }
      }
      finally {
        setTimeout(() => {
          setIsDownloading(false)
        }, 2000)
      }
    }
  }

  const handleCopyImage = async () => {
    if (graphRef.current && username && canUseClipboardItem && !isCopying) {
      try {
        setIsCopying(true)
        trackEvent('Click Copy Image')

        const item = new ClipboardItem({
          'image/png': (async () => {
            // To be able to use `ClipboardItem` in safari, need to pass promise directly into it.
            // @see https://stackoverflow.com/questions/66312944/javascript-clipboard-api-write-does-not-work-in-safari
            if (!graphRef.current) {
              throw new Error()
            }

            const blobData = await toBlob(graphRef.current)

            if (!blobData) {
              throw new Error()
            }

            return blobData
          })(),
        })

        await navigator.clipboard.write([item])

        setCopySuccess(true)

        setTimeout(() => {
          setCopySuccess(false)
        }, 2000)
      }
      catch (err) {
        if (err instanceof Error) {
          trackEvent('Error: Copy Image', { msg: err.message })
        }
      }
      finally {
        setIsCopying(false)
      }
    }
  }

  return {
    canUseClipboardItem,
    isDownloading,
    isCopying,
    copySuccess,
    handleDownload,
    handleCopyImage,
  }
}
