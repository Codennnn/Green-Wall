'use client'

import { useTranslations } from 'next-intl'

import { GraphSize } from '~/enums'

export interface GraphTooltipLabelProps {
  count: number
  date: string
  size: GraphSize
}

export function GraphTooltipLabel({ count, date, size }: GraphTooltipLabelProps) {
  const t = useTranslations('graph')

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
