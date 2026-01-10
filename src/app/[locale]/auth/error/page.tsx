import { Suspense } from 'react'

import { getLocale, getTranslations } from 'next-intl/server'

import { AuthErrorContent } from './AuthErrorContent'

function AuthErrorSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="size-16 animate-pulse rounded-full bg-muted" />
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-4 w-64 animate-pulse rounded bg-muted" />
    </div>
  )
}

export async function generateMetadata() {
  const t = await getTranslations('auth.error')

  return {
    title: t('title'),
  }
}

export default async function AuthErrorPage() {
  const locale = await getLocale()

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={<AuthErrorSkeleton />}>
        <AuthErrorContent locale={locale} />
      </Suspense>
    </div>
  )
}
