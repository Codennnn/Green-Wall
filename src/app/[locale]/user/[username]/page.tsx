import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { DataProvider } from '~/DataContext'

import { UserPage } from './UserPage'

type GenerateMetadata = (params: {
  params: Promise<{ username: string, locale: string }>
}) => Promise<Metadata>

export const generateMetadata: GenerateMetadata = async ({ params }): Promise<Metadata> => {
  const { username, locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const title = t('userOgTitle', { username })
  const description = t('userOgDescription', { username })
  const sharingURL = `https://green-wall.leoku.dev/share/${username}`
  const image = `https://green-wall.leoku.dev/api/og/share/${username}`

  return {
    title: t('userTitle', { username }),
    openGraph: {
      title,
      description,
      url: sharingURL,
      images: image,
    },
    twitter: {
      title,
      description,
      card: 'summary_large_image',
      images: image,
    },
  }
}

export default function Page() {
  return (
    <DataProvider key="share">
      <UserPage />
    </DataProvider>
  )
}
