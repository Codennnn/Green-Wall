'use client'

import { useTranslations } from 'next-intl'
import { CodeIcon, FileTextIcon, PackageIcon } from 'lucide-react'

import { StaticCard, StaticCardTitle } from '~/components/StaticCard'
import { TextLink } from '~/components/TextLink'
import { Badge } from '~/components/ui/badge'
import type { RepoTechStackMetrics } from '~/types'

interface TechStackSectionProps {
  techStack: RepoTechStackMetrics
}

/**
 * 格式化文件大小
 */
function formatBytes(kb: number): string {
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`
  }

  const mb = kb / 1024

  if (mb < 1024) {
    return `${mb.toFixed(1)} MB`
  }

  const gb = mb / 1024

  return `${gb.toFixed(2)} GB`
}

export default function TechStackSection({ techStack }: TechStackSectionProps) {
  const t = useTranslations('repo.analysis.techStack')

  const topLanguages = techStack.languages.items.slice(0, 5)
  const hasLanguages = topLanguages.length > 0

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 语言分布 */}
        <StaticCard>
          <div className="flex items-center gap-grid-item p-grid-item">
            <StaticCardTitle icon={<CodeIcon className="size-5" />}>
              {t('languages')}
            </StaticCardTitle>
          </div>

          <div className="p-grid-item pt-0">
            {hasLanguages
              ? (
                  <div className="space-y-3">
                    {topLanguages.map((lang) => (
                      <div
                        key={lang.name}
                        className="space-y-1"
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-fg-muted">
                            {lang.percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )
              : (
                  <p className="text-sm text-fg-muted italic">
                    {t('noLanguages')}
                  </p>
                )}
          </div>
        </StaticCard>

        {/* 版本发布信息 */}
        <StaticCard>
          <div className="flex items-center gap-grid-item p-grid-item">
            <StaticCardTitle icon={<PackageIcon className="size-5" />}>
              {t('releases')}
            </StaticCardTitle>
          </div>

          <div className="p-grid-item pt-0">
            {techStack.releases.latest
              ? (
                  <div className="space-y-3">
                    <div>
                      <div className="text-sm text-fg-muted">{t('latestRelease')}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary">
                          {techStack.releases.latest.tagName}
                        </Badge>
                        <TextLink
                          className="text-sm"
                          href={techStack.releases.latest.url}
                          target="_blank"
                        >
                          {t('viewRelease')}
                        </TextLink>
                      </div>
                    </div>

                    <div className="text-xs text-fg-muted">
                      {t('publishedAt')}
                      {': '}
                      {new Date(techStack.releases.latest.publishedAt).toLocaleDateString()}
                    </div>

                    <div className="text-xs text-fg-muted">
                      {t('totalReleases')}
                      {': '}
                      {techStack.releases.totalCount}
                    </div>
                  </div>
                )
              : (
                  <div className="space-y-2">
                    <p className="text-sm text-fg-muted italic">
                      {t('noReleases')}
                    </p>
                    {techStack.releases.totalCount > 0 && (
                      <div className="text-xs text-fg-muted">
                        {t('totalReleases')}
                        {': '}
                        {techStack.releases.totalCount}
                      </div>
                    )}
                  </div>
                )}
          </div>
        </StaticCard>

        {/* 许可证和 Topics */}
        <StaticCard>
          <div className="flex items-center gap-grid-item p-grid-item">
            <StaticCardTitle icon={<FileTextIcon className="size-5" />}>
              {t('license')}
            </StaticCardTitle>
          </div>

          <div className="p-grid-item pt-0">
            {techStack.license
              ? (
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {techStack.license.name ?? techStack.license.spdxId ?? t('noLicense')}
                    </Badge>
                    {techStack.license.url && (
                      <div>
                        <TextLink
                          className="text-xs"
                          href={techStack.license.url}
                          target="_blank"
                        >
                          View License
                        </TextLink>
                      </div>
                    )}
                  </div>
                )
              : (
                  <p className="text-sm text-fg-muted italic">
                    {t('noLicense')}
                  </p>
                )}

            {techStack.diskUsage !== null && (
              <div className="mt-4 text-xs text-fg-muted">
                {t('diskUsage')}
                {': '}
                <span className="font-medium">
                  {formatBytes(techStack.diskUsage)}
                </span>
              </div>
            )}
          </div>
        </StaticCard>
      </div>
    </section>
  )
}
