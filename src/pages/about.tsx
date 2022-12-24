import Link from 'next/link'

import Layout from '../components/Layout'

export default function AboutPage() {
  return (
    <div className="py-10 md:py-14">
      <div className="px-2 md:px-20">
        <h2 className="mb-2 text-lg font-bold md:text-3xl">How it works</h2>
        <p className="py-2">
          This project uses the GitHub GraphQL API to fetch data and uses Next.js API Routes to send
          requests, you can read{' '}
          <Link
            passHref
            className="underline decoration-current decoration-dotted underline-offset-[3px] transition-colors duration-200 hover:text-main-500/90"
            href="https://github.com/Codennnn/Green-Wall/blob/3773c0dd49c09be78341a800f97b591b5b219efa/src/pages/api/contribution/%5Busername%5D.ts"
            target="_blank"
          >
            this file
          </Link>{' '}
          to learn how we handle your data.
        </p>

        <h2 className="mt-8 mb-2 text-lg font-bold md:text-3xl">Credits</h2>
        <p className="py-2">
          Thanks to the{' '}
          <Link
            passHref
            className="underline decoration-current decoration-dotted underline-offset-[3px] transition-colors duration-200 hover:text-main-500/90"
            href="https://github.com/sallar/github-contributions-chart"
            target="_blank"
          >
            &ldquo;GitHub Contributions Chart Generator&rdquo;
          </Link>{' '}
          for the inspiration, it&apos;s a very interesting project !
        </p>
      </div>
    </div>
  )
}

AboutPage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}
