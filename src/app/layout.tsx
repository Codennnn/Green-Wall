import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import Script from 'next/script'
import { getLocale, getTranslations } from 'next-intl/server'

import { BgDecoration } from '~/components/BgDecoration'
import { ThemeProvider } from '~/components/ThemeProvider'
import { siteConfig } from '~/config/site'
import { isDevelopment } from '~/helpers'
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

export default async function RootLayout(props: React.PropsWithChildren) {
  const locale = await getLocale()
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
            {props.children}
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
