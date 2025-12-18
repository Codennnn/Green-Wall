import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { Button } from '~/components/ui/button'

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
      <Button
        variant="outline"
      >
        {iconGitHub}
        <span>{tCommon('openSource')}</span>
      </Button>
    </Link>
  )
}
