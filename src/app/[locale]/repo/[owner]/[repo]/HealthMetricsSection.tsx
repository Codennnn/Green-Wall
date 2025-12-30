'use client'

import { useTranslations } from 'next-intl'
import { ActivityIcon, GitPullRequestIcon } from 'lucide-react'

import { StaticCard, StaticCardTitle } from '~/components/StaticCard'
import { Progress } from '~/components/ui/progress'
import type { RepoHealthMetrics } from '~/types'

interface HealthMetricsSectionProps {
  health: RepoHealthMetrics
}

export default function HealthMetricsSection({ health }: HealthMetricsSectionProps) {
  const t = useTranslations('repo.analysis.healthMetrics')

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{t('title')}</h2>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Issue 健康度 */}
        <StaticCard>
          <div className="flex items-center gap-grid-item p-grid-item">
            <StaticCardTitle icon={<ActivityIcon className="size-5" />}>
              {t('issueStatus')}
            </StaticCardTitle>
          </div>

          <div className="p-grid-item pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">Open</span>
                <span className="font-medium">
                  {health.issues.open.toLocaleString()}
                </span>
              </div>
              <Progress
                className="h-2"
                value={health.issues.openRatio * 100}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">Closed</span>
                <span className="font-medium">
                  {health.issues.closed.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-fg-muted">
              {t('openRatio')}
              {': '}
              {(health.issues.openRatio * 100).toFixed(1)}%
            </div>
          </div>
        </StaticCard>

        {/* PR 健康度 */}
        <StaticCard>
          <div className="flex items-center gap-grid-item p-grid-item">
            <StaticCardTitle icon={<GitPullRequestIcon className="size-5" />}>
              {t('prStatus')}
            </StaticCardTitle>
          </div>

          <div className="p-grid-item pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">Open</span>
                <span className="font-medium">
                  {health.pullRequests.open.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">Merged</span>
                <span className="font-medium text-green-600">
                  {health.pullRequests.merged.toLocaleString()}
                </span>
              </div>
              <Progress
                className="h-2"
                value={health.pullRequests.mergedRatio * 100}
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-fg-muted">Closed</span>
                <span className="font-medium">
                  {health.pullRequests.closed.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-fg-muted">
              {t('mergedRatio')}
              {': '}
              {(health.pullRequests.mergedRatio * 100).toFixed(1)}%
            </div>
          </div>
        </StaticCard>
      </div>
    </section>
  )
}
