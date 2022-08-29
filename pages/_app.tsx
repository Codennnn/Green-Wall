import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/graph.css'

import { type AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}
