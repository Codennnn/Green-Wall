import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { GitHubButton } from '~/components/GitHubButton'
import { QueryProvider } from '~/components/QueryProvider'
import { ThemeModeSelector } from '~/components/ThemeModeSelector'
import { ThemeProvider } from '~/components/ThemeProvider'
import { routing } from '~/i18n/routing'

interface Props {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const tNav = await getTranslations('nav')
  const tFooter = await getTranslations('footer')
  const tCommon = await getTranslations('common')

  return (
    <NextIntlClientProvider>
      <ThemeProvider>
        <QueryProvider>
          <div className="flex min-h-screen flex-col px-4 md:mx-auto md:min-w-content md:max-w-content md:px-5">
            <header>
              <div className="flex h-[65px] items-center md:h-[80px]">
                <Link href={`/${locale}`}>
                  <span className="flex cursor-pointer select-none items-center bg-background  text-xl font-bold ring-4 ring-background">
                    <span className="pointer-events-none relative size-8 md:size-7">
                      <Image fill alt="LOGO" className="object-contain" src="/favicon.svg" />
                    </span>
                    <span className="ml-3 hidden md:inline" translate="no">
                      {tCommon('appName')}
                    </span>
                  </span>
                </Link>

                <div className="ml-auto flex items-center gap-3">
                  <GitHubButton />
                  <ThemeModeSelector />
                </div>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            <footer className="sticky top-[100vh] py-3 text-center text-xs text-main-400/70 md:text-sm">
              <Link
                passHref
                className="transition-colors duration-200 hover:text-main-500/90"
                href="https://github.com/Codennnn"
                target="_blank"
              >
                {tFooter('madeBy', { author: 'LeoKu' })}
              </Link>
              <span className="mx-2 font-medium md:mx-3">·</span>
              <Link className="transition-colors duration-200 hover:text-main-500/90" href={`/${locale}/about`}>
                {tNav('about')}
              </Link>
            </footer>
          </div>
        </QueryProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
