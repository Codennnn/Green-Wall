import Link from 'next/link'

import { trackEvent } from '../helpers'

import { iconGitHub } from './icons'

export function GitHubButton() {
  const handleClick = () => {
    trackEvent('Click GitHub Source Code')
  }

  return (
    <Link
      passHref
      className="ml-auto"
      href="https://github.com/Codennnn/Green-Wall"
      rel="noreferrer"
      target="_blank"
      onAuxClick={handleClick}
      onClick={handleClick}
    >
      <button className="flex items-center rounded-md bg-main-100 px-3 py-2 text-sm font-medium text-main-500 ring-4 ring-white transition-colors duration-300 hover:bg-main-200 md:ring-8">
        {iconGitHub}
        <span className="ml-2">Open Source</span>
      </button>
    </Link>
  )
}
