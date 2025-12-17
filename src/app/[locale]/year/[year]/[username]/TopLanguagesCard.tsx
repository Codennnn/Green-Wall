import { useTranslations } from 'next-intl'
import { SquareCodeIcon } from 'lucide-react'

import { LanguageIcon } from '~/components/LanguageIcon'
import { Badge } from '~/components/ui/badge'
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from '~/components/ui/empty'
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from '~/components/ui/progress'
import { Skeleton } from '~/components/ui/skeleton'
import type { TopLanguageItem } from '~/lib/language-stats'

import { StatCard, type StatCardProps } from './StaticCard'

function formatPercent(value: number): string {
  const percent = Math.round(value * 1000) / 10

  return `${percent.toFixed(1)}%`
}

export interface TopLanguagesCardProps extends Pick<StatCardProps, 'icon' | 'title'> {
  isLoading: boolean
  items: TopLanguageItem[]
}

export function TopLanguagesCard(props: TopLanguagesCardProps) {
  const {
    icon,
    title,
    isLoading,
    items,
  } = props

  const t = useTranslations('stats')

  return (
    <StatCard
      cardClassName="h-full"
      icon={icon}
      title={title}
    >
      <div className="p-grid-item-sm">
        <div className="p-grid-item pt-grid-item-sm">
          {isLoading
            ? (
                <div className="flex flex-col gap-grid-item">
                  {Array.from({ length: 5 }).map((_, index) => {
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <Skeleton className="h-6 w-10 shrink-0" />

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-2">
                              <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
                              <Skeleton className="h-4 w-20" />
                            </div>
                            <Skeleton className="h-3 w-12 shrink-0" />
                          </div>

                          <Skeleton className="mt-1 h-2 w-full" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            : items.length === 0
              ? (
                  <Empty className="border-0 p-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <SquareCodeIcon />
                      </EmptyMedia>
                      <EmptyDescription>
                        {t('noLanguageData')}
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )
              : (
                  <div className="flex flex-col gap-grid-item">
                    {items.map((item, index) => {
                      const itemRatio = typeof item.ratio === 'number' ? item.ratio : 0
                      const ratio = Math.round(itemRatio * 100)

                      return (
                        <div key={item.language} className="flex items-center gap-3">
                          <Badge className="tabular-nums" size="sm" variant="secondary">
                            #{index + 1}
                          </Badge>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2 truncate font-medium text-sm">
                                <LanguageIcon
                                  language={item.language}
                                  size={16}
                                />
                                <span className="truncate">{item.language}</span>
                              </div>
                              <div className="shrink-0 tabular-nums text-muted-foreground text-xs">
                                {formatPercent(itemRatio)}
                              </div>
                            </div>

                            <Progress className="mt-1" max={100} value={ratio}>
                              <ProgressTrack>
                                <ProgressIndicator />
                              </ProgressTrack>
                            </Progress>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
        </div>
      </div>
    </StatCard>
  )
}
