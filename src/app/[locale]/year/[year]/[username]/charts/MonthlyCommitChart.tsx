'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { CalendarRangeIcon } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { Badge } from '~/components/ui/badge'
import { numberWithCommas } from '~/helpers'
import type { ContributionCalendar } from '~/types'

import { createMonthShortNames, type MonthAbbr } from './chart-i18n'
import { getMonthlyChartData, type MonthlyChartData } from './chart-utils'
import { ChartCard, ChartSummaryItem } from './ChartCard'

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: MonthlyChartData }[]
  contributionsLabel?: string
  monthNames?: Partial<Record<MonthAbbr, string>>
}

function CustomTooltip({
  active,
  payload,
  contributionsLabel = 'contributions',
  monthNames,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload
  const monthLabel = monthNames?.[data.month as MonthAbbr] ?? data.month

  return (
    <div className="rounded-lg border border-border bg-popover p-grid-item shadow-lg">
      <p className="font-medium text-popover-foreground text-sm">
        {monthLabel}
      </p>
      <p className="text-muted-foreground text-xs">
        {numberWithCommas(data.count)} {contributionsLabel}
      </p>
    </div>
  )
}

export interface MonthlyCommitChartProps {
  calendars: ContributionCalendar[] | undefined
  isLoading: boolean
  year: number
}

export function MonthlyCommitChart(props: MonthlyCommitChartProps) {
  const { calendars, isLoading, year } = props
  const t = useTranslations('stats')
  const tMonths = useTranslations('months')

  const { data, summary } = useMemo(
    () => getMonthlyChartData(calendars),
    [calendars],
  )

  const monthShortNames = useMemo(
    () => createMonthShortNames(tMonths),
    [tMonths],
  )

  const summarySlot = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <ChartSummaryItem
        label={t('total')}
        value={numberWithCommas(summary.totalContributions)}
      />
      {summary.maxMonth && (
        <Badge variant="outline">
          {t('peak', { month: monthShortNames[summary.maxMonth as MonthAbbr] })}
        </Badge>
      )}
    </div>
  )

  return (
    <ChartCard
      icon={<CalendarRangeIcon className="size-5" />}
      isLoading={isLoading}
      summarySlot={summarySlot}
      title={t('monthlyDistribution', { year })}
    >
      <ResponsiveContainer height={200} width="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="3 3"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="month"
            fontSize={12}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(value: string) => {
              return monthShortNames[value as MonthAbbr]
            }}
            tickLine={false}
            tickMargin={8}
          />
          <YAxis
            axisLine={false}
            fontSize={12}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(value: number) => {
              if (value >= 1000) {
                return `${(value / 1000).toFixed(1)}k`
              }

              return String(value)
            }}
            tickLine={false}
            tickMargin={8}
          />
          <Tooltip
            content={(
              <CustomTooltip
                contributionsLabel={t('contributions')}
                monthNames={monthShortNames}
              />
            )}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
          />
          <Bar
            animationDuration={800}
            dataKey="count"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry) => (
              <Cell
                key={entry.month}
                className="transition-opacity hover:opacity-80"
                fill={entry.isMax ? 'var(--color-brand-500)' : 'var(--color-brand-300)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}
