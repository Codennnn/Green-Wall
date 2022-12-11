import { useEffect } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import GitHubButton from './GitHubButton'

export default function Layout(props: React.PropsWithChildren) {
  const router = useRouter()

  useEffect(() => {
    if (router.route === '/' || router.route.startsWith('/share')) {
      window.document.body.classList.add('bg-decoration')

      return () => {
        window.document.body.classList.remove('bg-decoration')
      }
    }
  }, [router.route])

  return (
    <>
      <Head>
        <title>Green Wall · GitHub contribution graph generator</title>
      </Head>

      <div className="min-h-screen px-4 sm:px-5 md:mx-auto md:min-w-content md:max-w-content lg:px-0">
        <header>
          <div className="flex h-[65px] items-center md:h-[80px]">
            <Link href="/">
              <span className="flex cursor-pointer select-none items-center bg-white  text-xl font-bold ring-4 ring-white">
                <span className="pointer-events-none relative h-8 w-8 md:h-7 md:w-7">
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

        <main>{props.children}</main>

        <footer className="sticky top-[100vh] py-3 text-center text-xs text-main-400/70 md:text-sm">
          <Link
            passHref
            className="transition-colors duration-200 hover:text-main-500/90"
            href="https://github.com/Codennnn"
            target="_blank"
          >
            Made by LeoKu.
          </Link>
          <span className="mx-2 font-medium md:mx-3">·</span>
          <Link
            passHref
            className="transition-colors duration-200 hover:text-main-500/90"
            href="https://github-contributions.vercel.app"
            target="_blank"
          >
            Inspired by GitHub Contributions Chart Generator.
          </Link>
        </footer>
      </div>
    </>
  )
}
