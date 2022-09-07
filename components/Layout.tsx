import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import GitHubButton from './GitHubButton'

export default function Layout(props: { children?: React.ReactNode }) {
  return (
    <>
      <Head>
        <title>Green Wall · GitHub contribution graph generator</title>
      </Head>

      <div className="min-h-screen px-5 md:mx-auto md:min-w-content md:max-w-content lg:px-0">
        <header>
          <div className="flex h-header items-center">
            <Link href="/">
              <span className="flex cursor-pointer select-none items-center text-xl font-bold">
                <span className="md:h0-8 pointer-events-none h-8 w-8 bg-white md:w-7">
                  <Image height="100%" layout="responsive" src="/favicon.svg" width="100%" />
                </span>
                <span className="ml-3 hidden md:inline">Green Wall</span>
              </span>
            </Link>

            <GitHubButton />
          </div>
        </header>

        <main>{props.children}</main>

        <footer className="sticky top-[100vh] py-3 text-center text-sm text-main-400">
          Power by Vercel
        </footer>
      </div>
    </>
  )
}
