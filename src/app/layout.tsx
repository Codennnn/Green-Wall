import type { Metadata, Viewport } from 'next'
import { Rubik } from 'next/font/google'

import { BgDecoration } from '~/components/BgDecoration'
import { cn } from '~/lib/utils'

import '~/styles/globals.css'

const rubik = Rubik({
  weight: ['400', '500'],
  display: 'swap',
  subsets: ['latin'],
})

export const viewport: Viewport = {
  colorScheme: 'light dark',
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

export default function RootLayout(props: React.PropsWithChildren) {
  return (
    <>
      <html
        suppressHydrationWarning
        className={cn(
          'h-full overflow-hidden motion-safe:scroll-smooth', rubik.className,
        )}
      >
        <body className="m-0 h-full overflow-y-auto">
          {props.children}
        </body>
      </html>

      <BgDecoration />
    </>
  )
}
