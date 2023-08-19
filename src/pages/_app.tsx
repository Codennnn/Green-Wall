import { useEffect } from 'react'

import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { Rubik } from 'next/font/google'
import splitbee from '@splitbee/web'

import '~/styles/reset.css'
import '~/styles/globals.css'

const rubik = Rubik({
  weight: ['400', '500'],
  display: 'swap',
  subsets: ['latin'],
})

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page)

  useEffect(() => {
    splitbee.init()
  }, [])

  return (
    <>
      {/* eslint-disable react/no-unknown-property */}
      <style global jsx>
        {`
          :root {
            font-family:
              ${rubik.style.fontFamily},
              ui-sans-serif,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              sans-serif;
          }
        `}
      </style>

      {getLayout(<Component {...pageProps} />)}
    </>
  )
}
