import Link from 'next/link'
import { useState } from 'react'

import type { Theme } from '../types'
import { iconShare } from './icons'
import Popover from './kit/Popover'

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
        <div className="max-w-[90vw] rounded-md pt-5 md:max-w-[min(40vw,400px)]">
          {shareUrl && (
            <div className="flex h-8 flex-wrap items-center justify-end gap-2 text-xs text-main-500">
              <Link passHref href={shareUrl}>
                <a
                  className="flex h-full flex-1 cursor-pointer items-center break-all rounded bg-main-100/80 py-1 px-3 transition-colors duration-200 hover:bg-main-200/80"
                  target="_blank"
                  title="preview"
                >
                  {shareUrl}
                </a>
              </Link>
              <button
                className="inline-block h-full min-w-[3.5rem] rounded bg-accent-100 px-1 text-accent-600"
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
      title="Share Your Graph"
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
