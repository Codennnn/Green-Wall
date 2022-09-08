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
          <div className="flex h-[65px] items-center md:h-[80px]">
            <Link href="/">
              <span className="flex cursor-pointer select-none items-center bg-white px-2 py-1 text-xl font-bold">
                <span className="pointer-events-none h-8 w-8 md:h-7 md:w-7">
                  <Image height="100%" layout="responsive" src="/favicon.svg" width="100%" />
                </span>
                <span className="ml-3 hidden md:inline">Green Wall</span>
              </span>
            </Link>

            <GitHubButton />
          </div>
        </header>

        <main>{props.children}</main>

        <footer className="sticky top-[100vh] py-3 text-center text-sm text-main-400/70">
          <Link passHref href="https://leoku.top">
            <a className="transition-colors duration-200 hover:text-main-500/90" target="_blank">
              Made by LeoKu.
            </a>
          </Link>
          <span className="mx-3 font-medium">·</span>
          <Link passHref href="https://github-contributions.vercel.app">
            <a className="transition-colors duration-200 hover:text-main-500/90" target="_blank">
              Inspired by GitHub Contributions Chart Generator.
            </a>
          </Link>
        </footer>
      </div>
    </>
  )
}
