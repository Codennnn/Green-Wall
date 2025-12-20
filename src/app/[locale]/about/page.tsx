import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { TextLink } from '~/components/TextLink'

type GenerateMetadata = (params: {
  params: Promise<{ locale: string }>
}) => Promise<Metadata>

export const generateMetadata: GenerateMetadata = async ({ params }): Promise<Metadata> => {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  const title = t('aboutTitle')
  const description = t('aboutDescription')
  const ogTitle = t('aboutOgTitle')
  const ogDescription = t('aboutOgDescription')

  return {
    title,
    description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: 'https://green-wall.leoku.dev/about',
    },
    twitter: {
      title: ogTitle,
      description: ogDescription,
    },
  }
}

const PageTitle = (props: React.PropsWithChildren) => (
  <h1 className="mb-6 text-2xl font-bold md:mb-8 md:text-3xl">
    {props.children}
  </h1>
)

const SectionTitle = (props: React.PropsWithChildren) => (
  <h2 className="mb-1 mt-5 text-lg font-bold md:mb-2 md:mt-8 md:text-2xl">
    {props.children}
  </h2>
)

const Paragraph = (props: React.PropsWithChildren) => <p className="py-2">{props.children}</p>

export default async function AboutPage() {
  const t = await getTranslations('about')

  return (
    <div className="py-10 md:py-14">
      <div className="px-2 md:px-20">
        <PageTitle>{t('pageTitle')}</PageTitle>
        <Paragraph>
          {t('intro')}
        </Paragraph>

        <SectionTitle>{t('whyWeBuilt')}</SectionTitle>
        <Paragraph>
          {t('whyWeBuiltContent')}
        </Paragraph>

        <SectionTitle>{t('howItHelps')}</SectionTitle>
        <Paragraph>
          {t('howItHelpsIntro')}
        </Paragraph>
        <ul className="list-inside list-disc py-2 pl-1 marker:text-sm marker:text-foreground/90">
          <li className="py-1">
            {t('howItHelpsItem1')}
          </li>
          <li className="py-1">
            {t('howItHelpsItem2')}
          </li>
          <li className="py-1">
            {t('howItHelpsItem3')}
          </li>
        </ul>

        <SectionTitle>{t('inspiration')}</SectionTitle>
        <Paragraph>
          {t('inspirationContent')}
        </Paragraph>

        <SectionTitle>{t('finalMessage')}</SectionTitle>
        <Paragraph>
          {t('finalMessageContent')}
        </Paragraph>

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
