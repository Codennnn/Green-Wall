'use client'

import { useTranslations } from 'next-intl'

import { DEFAULT_SIZE } from '~/constants'
import { useData } from '~/DataContext'
import { GraphSize } from '~/enums'

export interface GraphTooltipLabelProps {
  count: number
  date: string
}

export function GraphTooltipLabel({ count, date }: GraphTooltipLabelProps) {
  const { settings } = useData()
  const t = useTranslations('graph')

  const size = settings.size ?? DEFAULT_SIZE

  return (
    <span className={size === GraphSize.Small ? 'text-xs' : 'text-sm'}>
      {t.rich('tooltipContributionsInDate', {
        count,
        date,
        strong: (chunks) => <strong className="font-medium">{chunks}</strong>,
      })}
    </span>
  )
}
