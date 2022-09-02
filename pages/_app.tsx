import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/graph.css'

import splitbee from '@splitbee/web'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    splitbee.init()
  }, [])

  return <Component {...pageProps} />
}
