import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import type { PageProps } from '~/types/common'

import RepoAnalysisPage from './RepoAnalysisPage'

interface RepoParams {
  locale: string
  owner: string
  repo: string
}

export async function generateMetadata({
  params,
}: PageProps<RepoParams>): Promise<Metadata> {
  const { owner, repo, locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('repoTitle', { owner, repo }),
    description: t('repoDescription', { owner, repo }),
    openGraph: {
      title: t('repoOgTitle', { owner, repo }),
    },
  }
}

export default async function Page({ params }: PageProps<RepoParams>) {
  const { owner, repo } = await params

  return (
    <RepoAnalysisPage
      owner={owner}
      repo={repo}
    />
  )
}
