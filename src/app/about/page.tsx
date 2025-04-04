import { TextLink } from '~/components/TextLink'

const SectionTitle = (props: React.PropsWithChildren) => (
  <h2 className="mb-1 mt-5 text-lg font-bold first-of-type:mt-0 md:mb-2 md:mt-8 md:text-2xl">
    {props.children}
  </h2>
)

const Paragraph = (props: React.PropsWithChildren) => <p className="py-2">{props.children}</p>

export default function AboutPage() {
  return (
    <div className="py-10 md:py-14">
      <div className="px-2 md:px-20">
        <SectionTitle>Goal</SectionTitle>
        <Paragraph>
          Our goal is to make it easy for people to look back on their GitHub contributions over the
          years and share their achievements on social media and beyond.
        </Paragraph>

        <SectionTitle>How it works</SectionTitle>
        <Paragraph>
          This project leverages the GitHub GraphQL API to retrieve contribution data and utilizes
          Next.js API routes to process requests. For more details on our data handling practices,
          you can check out the
          {' '}
          <TextLink
            passHref
            className="font-bold"
            href="https://github.com/Codennnn/Green-Wall/blob/3773c0dd49c09be78341a800f97b591b5b219efa/src/pages/api/contribution/%5Busername%5D.ts"
            target="_blank"
          >
            relevant files
          </TextLink>
          .
        </Paragraph>

        <SectionTitle>Credits</SectionTitle>
        <ul className="list-inside list-disc py-2 pl-1 marker:text-sm marker:text-main-700/90">
          <li>
            <i className="mr-3 opacity-90">Inspiration:</i>
            <TextLink
              passHref
              href="https://github.com/sallar/github-contributions-chart"
              target="_blank"
            >
              GitHub Contributions Chart Generator.
            </TextLink>
          </li>
          <li>
            <i className="mr-3 opacity-90">Framework:</i>
            Next.js.
          </li>
          <li>
            <i className="mr-3 opacity-90">Font:</i>
            <TextLink passHref href="https://fonts.google.com/specimen/Rubik" target="_blank">
              Rubik
            </TextLink>
            {' '}
            by Google Fonts.
          </li>
          <li>
            <i className="mr-3 opacity-90">Icons:</i>
            <TextLink passHref href="https://heroicons.com" target="_blank">
              heroicons.
            </TextLink>
          </li>
        </ul>

        <SectionTitle>Support</SectionTitle>
        <Paragraph>
          Want to show your support for this project? You can star on
          {' '}
          <TextLink passHref href="https://github.com/Codennnn/Green-Wall" target="_blank">
            GitHub
          </TextLink>
          {' '}
          or vote on
          {' '}
          <TextLink passHref href="https://www.producthunt.com/posts/green-wall" target="_blank">
            Product Hunt
          </TextLink>
          , or you can share this website elsewhere!
        </Paragraph>

        <SectionTitle>Reporting Issues</SectionTitle>
        <Paragraph>
          Got bugs or have any suggestions for this project? Welcome to leave your message on the
          {' '}
          <TextLink passHref href="https://github.com/Codennnn/Green-Wall/issues" target="_blank">
            GitHub issues.
          </TextLink>
        </Paragraph>
      </div>
    </div>
  )
}
