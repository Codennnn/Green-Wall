import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { iconGitHub } from './icons'

export async function GitHubButton() {
  const tCommon = await getTranslations('common')

  return (
    <Link
      passHref
      href="https://github.com/Codennnn/Green-Wall"
      rel="noreferrer"
      target="_blank"
    >
      <button className="flex items-center rounded-md bg-main-100 px-3 h-[38px] text-sm font-medium text-main-500 ring-4 ring-background transition-colors duration-300 hover:bg-main-200 md:ring-8">
        {iconGitHub}
        <span className="ml-2">{tCommon('openSource')}</span>
      </button>
    </Link>
  )
}
