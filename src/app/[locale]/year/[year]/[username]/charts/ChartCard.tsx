'use client'

import type { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import { cn } from '~/lib/utils'

import { SpinningLoader, StaticCard, StaticCardTitle } from '../StaticCard'

export interface ChartCardProps {
  /** 卡片图标 */
  icon: ReactNode
  /** 卡片标题 */
  title: ReactNode
  /** 是否处于加载状态 */
  isLoading: boolean
  /** 右侧统计信息插槽 */
  summarySlot?: ReactNode
  /** 图表内容 */
  children: ReactNode
  /** 自定义容器类名 */
  className?: string
}

export function ChartCard(props: ChartCardProps) {
  const {
    icon,
    title,
    isLoading,
    summarySlot,
    children,
    className,
  } = props

  return (
    <StaticCard contentClassName={cn('flex-col items-stretch gap-grid-item p-grid-item', className)}>
      {/* 标题栏 */}
      <div className="flex items-center gap-grid-item">
        <StaticCardTitle icon={icon}>
          {title}
        </StaticCardTitle>

        <div className="ml-auto">
          {isLoading ? <SpinningLoader /> : summarySlot}
        </div>
      </div>

      {/* 图表内容区域 */}
      <div className="relative min-h-[200px] pt-grid-item">
        {
          isLoading
            ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-full animate-pulse rounded-md bg-foreground/5" />
                </div>
              )
            : children
        }
      </div>
    </StaticCard>
  )
}

export interface ChartSummaryItemProps {
  label: string
  value: ReactNode
}

export function ChartSummaryItem(props: ChartSummaryItemProps) {
  const { label, value } = props

  const t = useTranslations('common')

  return (
    <div className="flex items-center gap-0.5 text-xs">
      <span className="text-muted-foreground">{label}{t('colon')}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}
