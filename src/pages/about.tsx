import Link from 'next/link'

import Layout from '../components/Layout'

const SectionTitle = (props: React.PropsWithChildren) => (
  <h2 className="mb-1 mt-5 text-lg font-bold first-of-type:mt-0 md:mt-8 md:mb-2 md:text-2xl">
    {props.children}
  </h2>
)

const Paragraph = (props: React.PropsWithChildren) => <p className="py-2">{props.children}</p>

const TextLink = ({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof Link>>) => (
  <Link
    className="underline decoration-current decoration-dotted underline-offset-[3px] transition-colors duration-200 hover:text-main-500/90"
    {...props}
  >
    {children}
  </Link>
)

export default function AboutPage() {
  return (
    <div className="py-10 md:py-14">
      <div className="px-2 md:px-20">
        <SectionTitle>How it works</SectionTitle>
        <Paragraph>
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
        </Paragraph>

        <SectionTitle>Credits</SectionTitle>
        <ul className="list-inside list-disc py-2 pl-1 marker:text-sm marker:text-main-700/90">
          <li>
            <i className="mr-3 opacity-90">Inspired by:</i>
            <TextLink
              passHref
              href="https://github.com/sallar/github-contributions-chart"
              target="_blank"
            >
              GitHub Contributions Chart Generator.
            </TextLink>
          </li>
          <li>
            <i className="mr-3 opacity-90">Framework:</i>Next.js.
          </li>
          <li>
            <i className="mr-3 opacity-90">Font:</i>
            <TextLink passHref href="https://fonts.google.com/specimen/Rubik" target="_blank">
              Rubik
            </TextLink>{' '}
            by Google Fonts.
          </li>
        </ul>

        <SectionTitle>Support</SectionTitle>
        <Paragraph>
          Want to show your support for this project? You can star on{' '}
          <TextLink passHref href="https://github.com/Codennnn/Green-Wall" target="_blank">
            GitHub
          </TextLink>{' '}
          or vote on the{' '}
          <TextLink passHref href="https://www.producthunt.com/posts/green-wall" target="_blank">
            Product Hunt
          </TextLink>
          , or you can share this website!
        </Paragraph>

        <SectionTitle>Reporting issues</SectionTitle>
        <Paragraph>
          Got bugs or have any suggestions for this project? Welcome to leave your message on the{' '}
          <TextLink passHref href="https://github.com/Codennnn/Green-Wall/issues" target="_blank">
            GitHub issues.
          </TextLink>
        </Paragraph>
      </div>
    </div>
  )
}

AboutPage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}
