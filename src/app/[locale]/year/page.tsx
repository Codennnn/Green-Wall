import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { YearSearchPage } from './YearSearchPage'

type GenerateMetadata = (params: {
  params: Promise<{ locale: string }>
}) => Promise<Metadata>

export const generateMetadata: GenerateMetadata = async ({ params }): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'yearSearch' })

  const title = `${t('title')} · Green Wall`
  const description = t('description')

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  }
}

export default function YearPage() {
  return <YearSearchPage />
}
