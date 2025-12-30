'use client'

import { useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { ErrorMessage } from '~/components/ErrorMessage'
import { Loading } from '~/components/Loading/Loading'
import { useRepoAnalysisQuery } from '~/hooks/useQueries'
import { eventTracker } from '~/lib/analytics'

import HealthMetricsSection from './HealthMetricsSection'
import OwnerInfoSection from './OwnerInfoSection'
import RepoHeader from './RepoHeader'
import TechStackSection from './TechStackSection'

interface RepoAnalysisPageProps {
  owner: string
  repo: string
}

export default function RepoAnalysisPage({ owner, repo }: RepoAnalysisPageProps) {
  const t = useTranslations('repo.analysis')

  const { data, isLoading, isError, error } = useRepoAnalysisQuery(
    owner,
    repo,
    ['basic', 'health', 'techstack'],
  )

  // 追踪数据加载完成
  useEffect(() => {
    if (data) {
      eventTracker.repo.metrics.load(data.meta.metrics, 0)
    }
  }, [data])

  // 加载中
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loading />
      </div>
    )
  }

  // 错误处理
  if (isError || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorMessage
          text={error?.message ?? t('error')}
        />
      </div>
    )
  }

  const { basic, health, techStack, owner: ownerInfo } = data.data

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* 仓库头部 */}
      <RepoHeader
        basic={basic}
        topics={techStack?.topics}
      />

      {/* 拥有者信息区 */}
      {ownerInfo && <OwnerInfoSection owner={ownerInfo} />}

      {/* 技术栈分析区 */}
      {techStack && <TechStackSection techStack={techStack} />}

      {/* 健康度指标区 */}
      {health && <HealthMetricsSection health={health} />}
    </div>
  )
}
