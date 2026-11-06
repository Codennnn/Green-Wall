import { Suspense } from 'react'

import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Script from 'next/script'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getLocale, getTranslations } from 'next-intl/server'

import { AuthStatusButton, AuthStatusButtonSkeleton } from '~/components/AuthStatusButton'
import { BgDecoration } from '~/components/BgDecoration'
import { GitHubButton } from '~/components/GitHubButton'
import { LocaleSelector } from '~/components/LocaleSelector'
import { MainNav } from '~/components/MainNav'
import { QueryProvider } from '~/components/QueryProvider'
import { ThemeModeSelector } from '~/components/ThemeModeSelector'
import { ThemeProvider } from '~/components/ThemeProvider'
import { siteConfig } from '~/config/site'
import { isDevelopment } from '~/helpers'
import { routing } from '~/i18n/routing'
import { cn } from '~/lib/utils'

import '~/styles/globals.css'

const rubik = Rubik({
  weight: ['500', '600', '700'],
  display: 'swap',
  subsets: ['latin'],
  variable: '--font-sans',
})

export const viewport: Viewport = {
  colorScheme: 'light dark',
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    metadataBase: new URL(siteConfig.url),
    icons: [{ url: '/favicon.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' }],
    title: t('defaultTitle'),
    description: t('defaultDescription'),
    openGraph: {
      type: 'website',
      title: t('defaultOgTitle'),
      description: t('defaultOgDescription'),
      url: siteConfig.url,
      images:
        'https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg',
    },
    twitter: {
      title: t('defaultOgTitle'),
      description: t('defaultOgDescription'),
      card: 'summary_large_image',
      images:
        'https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg',
    },
    authors: [{ name: 'LeoKu', url: 'https://github.com/Codennnn' }],
  }
}

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const tNav = await getTranslations('nav')
  const tFooter = await getTranslations('footer')
  const tCommon = await getTranslations('common')

  const isZh = locale === 'zh'
  const isDev = isDevelopment()
  const umamiEnabled = process.env.NEXT_PUBLIC_UMAMI_ENABLED === 'true'
  const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  const umamiDomains = process.env.NEXT_PUBLIC_UMAMI_DOMAINS

  const shouldLoadUmami = !isDev && umamiEnabled && umamiWebsiteId && umamiScriptUrl

  // Umami configuration validation warning
  if (!isDev && umamiEnabled) {
    const missingConfig: string[] = []

    if (!umamiWebsiteId) {
      missingConfig.push('NEXT_PUBLIC_UMAMI_WEBSITE_ID')
    }

    if (!umamiScriptUrl) {
      missingConfig.push('NEXT_PUBLIC_UMAMI_SCRIPT_URL')
    }

    if (missingConfig.length > 0) {
      console.warn(
        `Umami analytics is enabled but missing required environment variables: ${missingConfig.join(', ')}. `
        + 'Please configure these variables in your environment or set NEXT_PUBLIC_UMAMI_ENABLED to false to disable analytics.',
      )
    }
  }

  return (
    <>
      <html
        suppressHydrationWarning
        className={cn(
          'h-full overflow-hidden motion-safe:scroll-smooth',
          rubik.variable,
        )}
        data-scroll-behavior="smooth"
        {...(isZh && {
          style: {
            '--font-sans': 'vivoSans, sans-serif',
          } as React.CSSProperties,
        })}
      >
        <body className="m-0 h-full overflow-y-auto">
          <ThemeProvider>
            <NextIntlClientProvider>
              <QueryProvider>
                <div
                  className="w-full"
                  id="app-container"
                >
                  <div className="flex min-h-screen flex-col px-4 md:mx-auto md:min-w-content md:max-w-content md:px-5">
                    <header>
                      <div className="flex h-[65px] items-center gap-6 md:h-[80px]">
                        <Link className="ring-4 ring-background" href={`/${locale}`}>
                          <span className="flex cursor-pointer select-none items-center bg-background  text-xl font-bold">
                            <span className="pointer-events-none relative size-8 md:size-7">
                              <Image fill alt="LOGO" className="object-contain" src="/favicon.svg" />
                            </span>
                            <span className="ml-3 hidden md:inline" translate="no">
                              {tCommon('appName')}
                            </span>
                          </span>
                        </Link>

                        <div className="flex-1 flex justify-center">
                          <MainNav locale={locale} />
                        </div>

                        <div className="ml-auto flex items-center gap-3 ring-4 ring-background bg-background">
                          <GitHubButton />
                          <LocaleSelector />
                          <ThemeModeSelector />
                          <Suspense fallback={<AuthStatusButtonSkeleton />}>
                            <AuthStatusButton />
                          </Suspense>
                        </div>
                      </div>
                    </header>

                    <main className="flex-1">{children}</main>

                    <footer className="sticky top-[100vh] py-3 text-center text-xs text-muted-foreground/70 md:text-sm">
                      <Link
                        passHref
                        className="transition-colors hover:text-foreground"
                        href="https://github.com/Codennnn"
                        target="_blank"
                      >
                        {tFooter('madeBy', { author: 'LeoKu' })}
                      </Link>

                      <span className="mx-2 font-medium md:mx-3">·</span>

                      <Link className="transition-colors hover:text-foreground" href={`/${locale}/about`}>
                        {tNav('about')}
                      </Link>
                    </footer>
                  </div>
                </div>
              </QueryProvider>
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>

      {shouldLoadUmami && (
        <Script
          defer
          data-do-not-track="true"
          data-exclude-search="true"
          data-website-id={umamiWebsiteId}
          src={umamiScriptUrl}
          {...(umamiDomains ? { 'data-domains': umamiDomains } : {})}
        />
      )}

      <BgDecoration />
    </>
  )
}
