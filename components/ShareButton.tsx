import Link from 'next/link'
import { useState } from 'react'

import type { Theme } from '../types'
import { iconShare } from './icons'
import Popover from './Popover'

interface ShareButtonProps {
  username?: string
  theme?: Theme['name']
}

export default function ShareButton({ username, theme }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState<string>()
  const [copied, setCopied] = useState(false)

  return (
    <Popover
      content={
        <div className="max-w-[90vw] rounded-md border-2 border-solid border-main-200 bg-white py-3 px-4 md:max-w-[50vw]">
          <div className="mb-2 font-bold text-main-500">Share your graph</div>
          {shareUrl && (
            <div className="flex flex-wrap items-center justify-end gap-y-2 gap-x-3 text-xs text-main-500">
              <Link passHref href={shareUrl}>
                <a
                  className="flex flex-1 cursor-pointer items-center rounded bg-main-100 p-2"
                  target="_blank"
                  title="preview"
                >
                  {shareUrl}
                </a>
              </Link>
              <button
                className="inline-block h-full min-w-[3.5rem] rounded bg-accent-100 py-2 px-1 text-accent-600"
                onClick={() => {
                  if (!copied) {
                    navigator.clipboard.writeText(shareUrl).then(() => {
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
          )}
        </div>
      }
      offset={15}
    >
      <button
        className="text-button divider"
        onClick={() => {
          const url = new URL(
            `${window.location.protocol}//${window.location.host}/share/${username}`
          )
          if (theme) {
            url.searchParams.append('theme', theme)
          }
          setShareUrl(url.toString())
        }}
      >
        <span className="h-5 w-5">{iconShare}</span>
        <span>Share</span>
      </button>
    </Popover>
  )
}
