import { useEffect, useRef, useState } from 'react'

import Link from 'next/link'

import { useData } from '../../DataContext'
import { DisplayName } from '../../types'

import styles from './Graph.module.css'

const Avatar = () => {
  const { graphData } = useData()

  const init = useRef(false)
  const avatarRoot = useRef<HTMLSpanElement>(null)
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>()

  useEffect(() => {
    const root = avatarRoot.current
    if (root && graphData && !init.current) {
      if (!root.hasChildNodes()) {
        setStatus('loading')
        const avatarImg = new window.Image()
        avatarImg.onload = () => {
          root.appendChild(avatarImg)
          setStatus('loaded')
        }
        avatarImg.onerror = () => {
          setStatus('error')
        }
        avatarImg.src = graphData.avatarUrl
        avatarImg.alt = `${graphData.login}'s avatar.`
        avatarImg.classList.add('h-full', 'w-full')
        init.current = true
      }
    }
  }, [graphData])

  return (
    <span
      ref={avatarRoot}
      className={`h-[1.7rem] w-[1.7rem] overflow-hidden rounded-full bg-[var(--level-0)] ${
        status === 'loading' ? 'animate-pulse' : ''
      }`}
    >
      {status === 'error' && (
        <span className="inline-block h-full w-full bg-gradient-to-br from-[var(--level-1)] to-[var(--level-2)]" />
      )}
    </span>
  )
}

export function GraphHeader() {
  const { graphData, settings } = useData()

  if (!graphData) {
    return null
  }

  const displayName =
    settings?.displayName === DisplayName.ProfileName ? graphData.name : graphData.login

  const username = graphData.login

  return (
    <div className="mb-4 flex items-center">
      <Link
        className="group flex items-center"
        href={`https://github.com/${username}`}
        target="_blank"
      >
        <span className="mr-3 h-6 w-6">
          <svg viewBox="0 0 24 24">
            <path
              clipRule="evenodd"
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z"
              fill="currentcolor"
              fillRule="evenodd"
            />
          </svg>
        </span>
        <span className="mr-3 text-xl">·</span>
        <span className="mr-3 flex items-center">
          <Avatar />
        </span>
        <span className="text-xl font-bold group-hover:underline" translate="no">
          {displayName}
        </span>
      </Link>

      <div className="ml-auto flex items-center text-xs">
        <span>Less</span>
        <ul className={`${styles['grids']} mx-2 grid grid-cols-5 gap-[3px]`}>
          <li className="day h-3 w-3" data-level="0" />
          <li className="day h-3 w-3" data-level="1" />
          <li className="day h-3 w-3" data-level="2" />
          <li className="day h-3 w-3" data-level="3" />
          <li className="day h-3 w-3" data-level="4" />
        </ul>
        <span>More</span>
      </div>
    </div>
  )
}
