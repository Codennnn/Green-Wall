import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'
import Image from 'next/image'
import Link from 'next/link'

import { BgDecoration } from '~/components/BgDecoration'
import { GitHubButton } from '~/components/GitHubButton'
import { QueryProvider } from '~/components/QueryProvider'

import '~/styles/reset.css'
import '~/styles/globals.css'

const rubik = Rubik({
  weight: ['400', '500'],
  display: 'swap',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  colorScheme: 'light',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://green-wall.leoku.dev'),
  icons: [{ url: '/favicon.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' }],
  title: 'Green Wall · GitHub contribution graph generator',
  description: 'Green Wall is a GitHub contribution graph generator.',
  openGraph: {
    type: 'website',
    title: 'Green Wall',
    description: 'GitHub contribution graph generator.',
    url: 'https://green-wall.leoku.dev',
    images:
      'https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg',
  },
  twitter: {
    title: 'Green Wall',
    description: 'GitHub contribution graph generator.',
    card: 'summary_large_image',
    images:
      'https://user-images.githubusercontent.com/47730755/188365689-c8bfbccc-01d6-45e7-ae8e-084fbbdce75f.jpg',
  },
  authors: [{ name: 'LeoKu', url: 'https://github.com/Codennnn' }],
}

export default function Layout(props: React.PropsWithChildren) {
  return (
    <>
      <html
        className={`h-full overflow-hidden bg-pageBg text-main-800 motion-safe:scroll-smooth ${rubik.className}`}
        lang="en"
      >
        <body className="m-0 h-full overflow-y-auto text-main-700">
          <QueryProvider>
            <div className="flex min-h-screen flex-col px-4 md:mx-auto md:min-w-content md:max-w-content md:px-5">
              <header>
                <div className="flex h-[65px] items-center md:h-[80px]">
                  <Link href="/">
                    <span className="flex cursor-pointer select-none items-center bg-pageBg  text-xl font-bold ring-4 ring-pageBg">
                      <span className="pointer-events-none relative size-8 md:size-7">
                        <Image fill alt="LOGO" className="object-contain" src="/favicon.svg" />
                      </span>
                      <span className="ml-3 hidden md:inline" translate="no">
                        Green Wall
                      </span>
                    </span>
                  </Link>

                  <GitHubButton />
                </div>
              </header>

              <main className="flex-1">{props.children}</main>

              <footer className="sticky top-[100vh] py-3 text-center text-xs text-main-400/70 md:text-sm">
                <Link
                  passHref
                  className="transition-colors duration-200 hover:text-main-500/90"
                  href="https://github.com/Codennnn"
                  target="_blank"
                >
                  Made by LeoKu
                </Link>
                <span className="mx-2 font-medium md:mx-3">·</span>
                <Link className="transition-colors duration-200 hover:text-main-500/90" href="/about">
                  About
                </Link>
              </footer>
            </div>
          </QueryProvider>
        </body>
      </html>

      <BgDecoration />
    </>
  )
}
