import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import YearPageContent from './YearPageContent'

type GenerateMetadata = (params: {
  params: Promise<{ username: string, year: string, locale: string }>
}) => Promise<Metadata>

export const generateMetadata: GenerateMetadata = async ({ params }): Promise<Metadata> => {
  const { username, year, locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const title = t('yearTitle', { username, year })
  const ogTitle = t('yearOgTitle', { username, year })
  const ogDescription = t('yearOgDescription', { username, year })
  const sharingURL = `https://green-wall.leoku.dev/year/${year}/${username}`

  return {
    title,
    description: ogDescription,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: sharingURL,
    },
    twitter: {
      title: ogTitle,
      description: ogDescription,
    },
  }
}

export default function YearPage() {
  return (
    <div>
      <YearPageContent />
    </div>
  )
}
