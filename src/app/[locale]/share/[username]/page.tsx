import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { getAbsoluteURL } from '~/config/site'
import { DataProvider } from '~/DataContext'

import { SharePage } from './SharePage'

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ username: string, locale: string }>
}): Promise<Metadata> => {
  const { username, locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const sharingTitle = t('shareOgTitle', { username })
  const sharingDescription = t('shareOgDescription')
  const sharingURL = getAbsoluteURL(`/share/${username}`)
  const image = getAbsoluteURL(`/api/og/share/${username}`)

  return {
    title: t('shareTitle', { username }),
    openGraph: {
      title: sharingTitle,
      description: sharingDescription,
      url: sharingURL,
      images: image,
    },
    twitter: {
      title: sharingTitle,
      description: sharingDescription,
      card: 'summary_large_image',
      images: image,
    },
  }
}

export default function Page() {
  return (
    <DataProvider key="share">
      <Suspense fallback={null}>
        <SharePage />
      </Suspense>
    </DataProvider>
  )
}
