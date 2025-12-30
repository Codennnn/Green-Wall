'use client'

import { useLocale, useTranslations } from 'next-intl'
import { FileTextIcon, GitCommitIcon, GitForkIcon, StarIcon } from 'lucide-react'

import { TextLink } from '~/components/TextLink'
import { Badge } from '~/components/ui/badge'
import {
  Tooltip,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import { getRelativeTime } from '~/helpers'
import type { RepoBasicMetrics } from '~/types'

interface RepoHeaderProps {
  basic: RepoBasicMetrics
  healthMetrics?: {
    healthScore?: number
    engagementScore?: number
  } | null
  topics?: string[]
}

export default function RepoHeader({ basic, healthMetrics, topics }: RepoHeaderProps) {
  const t = useTranslations('repo.analysis')
  const tRoot = useTranslations()
  const locale = useLocale()

  const lastPushDistance = getRelativeTime(basic.pushedAt, tRoot)
  const createdDistance = getRelativeTime(basic.createdAt, tRoot)

  return (
    <div className="space-y-4">
      {/* 仓库名称 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">
          <TextLink
            href={basic.url}
            target="_blank"
          >
            {basic.nameWithOwner}
          </TextLink>
        </h1>

        {/* 状态 badges */}
        <div className="flex flex-wrap gap-2">
          {basic.status.isPrivate && (
            <Badge variant="outline">{t('status.private')}</Badge>
          )}
          {basic.status.isArchived && (
            <Badge variant="outline">{t('status.archived')}</Badge>
          )}
          {basic.status.isFork && (
            <Badge variant="outline">{t('status.fork')}</Badge>
          )}
          {basic.status.isDisabled && (
            <Badge variant="outline">{t('status.disabled')}</Badge>
          )}
          {basic.defaultBranchName && (
            <Badge variant="outline">
              {t('defaultBranch')}
              {tRoot('common.colon')}
              {basic.defaultBranchName}
            </Badge>
          )}
        </div>
      </div>

      {/* 描述 */}
      <div>
        {basic.description
          ? (
              <p className="text-base text-fg-muted">{basic.description}</p>
            )
          : (
              <p className="text-sm text-fg-muted italic">
                {t('noDescription')}
              </p>
            )}
      </div>

      {/* Topics 标签 */}
      {topics && topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
            >
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {/* 时间信息 */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
        <div>
          {t('createdAt')}
          {tRoot('common.colon')}
          <time dateTime={basic.createdAt}>
            {createdDistance}
          </time>
          <span className="text-xs">
            ({new Date(basic.createdAt).toLocaleDateString(locale)})
          </span>
        </div>
        <span className="text-fg-muted/50">•</span>
        <div>
          {t('lastPush')}
          {tRoot('common.colon')}
          <time dateTime={basic.pushedAt}>
            {lastPushDistance}
          </time>
        </div>
      </div>

      {/* 指标概览 - 紧凑展示 */}
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-fg-muted">
          {/* 星标数 */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5">
                <StarIcon className="size-3.5" />
                <span>
                  {basic.stargazerCount.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipPopup>Stars</TooltipPopup>
          </Tooltip>

          {/* Fork 数 */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5">
                <GitForkIcon className="size-3.5" />
                <span>
                  {basic.forkCount.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipPopup>Forks</TooltipPopup>
          </Tooltip>

          {/* Commit 数 */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5">
                <GitCommitIcon className="size-3.5" />
                <span>
                  {basic.commitCount.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipPopup>Commits</TooltipPopup>
          </Tooltip>

          {/* Issues 总数 */}
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1.5">
                <FileTextIcon className="size-3.5" />
                <span>
                  {basic.issueCount.toLocaleString()}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipPopup>Issues</TooltipPopup>
          </Tooltip>

          {/* 健康分数 */}
          {healthMetrics?.healthScore !== undefined && healthMetrics.healthScore > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium">
                {t('healthScore')}
              </span>
              <span className="font-medium">
                {healthMetrics.healthScore.toFixed(1)}
              </span>
            </div>
          )}

          {/* 参与度分数 */}
          {healthMetrics?.engagementScore !== undefined && healthMetrics.engagementScore > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium">
                {t('engagementScore')}
              </span>
              <span className="font-medium">
                {healthMetrics.engagementScore.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </TooltipProvider>
    </div>
  )
}
