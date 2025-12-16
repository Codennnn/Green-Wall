import { getTranslations } from 'next-intl/server'

import { TextLink } from '~/components/TextLink'

const SectionTitle = (props: React.PropsWithChildren) => (
  <h2 className="mb-1 mt-5 text-lg font-bold first-of-type:mt-0 md:mb-2 md:mt-8 md:text-2xl">
    {props.children}
  </h2>
)

const Paragraph = (props: React.PropsWithChildren) => <p className="py-2">{props.children}</p>

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="py-10 md:py-14">
      <div className="px-2 md:px-20">
        <SectionTitle>{t('goal')}</SectionTitle>
        <Paragraph>
          {t('goalContent')}
        </Paragraph>

        <SectionTitle>{t('howItWorks')}</SectionTitle>
        <Paragraph>
          {t('howItWorksContent')}
          {' '}
          <TextLink
            passHref
            className="font-bold"
            href="https://github.com/Codennnn/Green-Wall/blob/3773c0dd49c09be78341a800f97b591b5b219efa/src/pages/api/contribution/%5Busername%5D.ts"
            target="_blank"
          >
            {t('relevantFiles')}
          </TextLink>
          .
        </Paragraph>

        <SectionTitle>{t('credits')}</SectionTitle>
        <ul className="list-inside list-disc py-2 pl-1 marker:text-sm marker:text-foreground/90">
          <li>
            <span className="mr-3 opacity-90">{t('inspiration')}{t('colon')}</span>
            <TextLink
              passHref
              href="https://github.com/sallar/github-contributions-chart"
              target="_blank"
            >
              GitHub Contributions Chart Generator.
            </TextLink>
          </li>
          <li>
            <span className="mr-3 opacity-90">{t('framework')}{t('colon')}</span>
            Next.js.
          </li>
          <li>
            <span className="mr-3 opacity-90">{t('font')}{t('colon')}</span>
            <TextLink passHref href="https://fonts.google.com/specimen/Rubik" target="_blank">
              Rubik
            </TextLink>
            {' '}
            by Google Fonts.
          </li>
          <li>
            <span className="mr-3 opacity-90">{t('icons')}{t('colon')}</span>
            <TextLink passHref href="https://heroicons.com" target="_blank">
              heroicons.
            </TextLink>
          </li>
        </ul>

        <SectionTitle>{t('support')}</SectionTitle>
        <Paragraph>
          {t.rich('supportContent', {
            github: (chunks) => (
              <TextLink passHref href="https://github.com/Codennnn/Green-Wall" target="_blank">
                {chunks}
              </TextLink>
            ),
            productHunt: (chunks) => (
              <TextLink passHref href="https://www.producthunt.com/posts/green-wall" target="_blank">
                {chunks}
              </TextLink>
            ),
          })}
        </Paragraph>

        <SectionTitle>{t('reportingIssues')}</SectionTitle>
        <Paragraph>
          {t.rich('reportingIssuesContent', {
            link: (chunks) => (
              <TextLink passHref href="https://github.com/Codennnn/Green-Wall/issues" target="_blank">
                {chunks}
              </TextLink>
            ),
          })}
        </Paragraph>
      </div>
    </div>
  )
}
