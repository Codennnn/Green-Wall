import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

export default async function NotFoundPage() {
  const t = await getTranslations('notFound')

  return (
    <div className="px-2 py-12 md:px-20 md:py-24">
      <h2 className="text-4xl font-semibold md:text-5xl">
        <span className="text-brand-500">{t('sorry')}</span>
        {' '}
        {t('title')}
      </h2>

      <p className="mt-6 md:mt-9 md:text-lg">
        {t('description')}
      </p>

      <p className="mt-6 md:mt-9">
        {t('backHome')}
        {' '}
        <Link className="text-brand-500" href="/">
          {t('homePage')}
        </Link>
        .
      </p>
    </div>
  )
}
