import Image from 'next/image'
import Link from 'next/link'

import GitHubButton from './GitHubButton'

export default function Layout(props: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen px-5 md:mx-auto md:min-w-content md:max-w-content lg:px-0">
      <header>
        <div className="flex h-header items-center">
          <Link href="/">
            <span className="flex select-none items-center text-xl font-bold">
              <Image height={24} src="/favicon.svg" width={24} />
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
  )
}
