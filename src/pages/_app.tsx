import splitbee from '@splitbee/web'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

import '../styles/globals.css'
import '../styles/reset.css'

type NextPageWithLayout = NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page)

  useEffect(() => {
    splitbee.init()
  }, [])

  return getLayout(<Component {...pageProps} />)
}
