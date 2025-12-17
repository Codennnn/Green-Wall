'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { CalendarDaysIcon } from 'lucide-react'
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

import { createWeekdayShortNames, type WeekdayAbbr } from './chart-i18n'
import { getWeeklyChartData, type WeeklyChartData } from './chart-utils'
import { ChartCard, ChartSummaryItem } from './ChartCard'

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: WeeklyChartData }[]
  dayNames?: Record<string, string>
  contributionsLabel?: string
}

function CustomTooltip({ active, payload, dayNames, contributionsLabel = 'contributions' }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload
  const defaultDayNames: Record<string, string> = {
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  }
  const names = dayNames ?? defaultDayNames

  return (
    <div className="rounded-lg border border-border bg-popover p-grid-item shadow-lg">
      <p className="font-medium text-popover-foreground text-sm">
        {names[data.day] ?? data.day}
      </p>
      <p className="text-muted-foreground text-xs">
        {numberWithCommas(data.count)} {contributionsLabel}
      </p>
    </div>
  )
}

export interface WeeklyCommitChartProps {
  calendars: ContributionCalendar[] | undefined
  isLoading: boolean
  year: number
}

export function WeeklyCommitChart(props: WeeklyCommitChartProps) {
  const { calendars, isLoading, year } = props
  const t = useTranslations('stats')
  const tWeekdays = useTranslations('weekdays')

  const { data, summary } = useMemo(
    () => getWeeklyChartData(calendars),
    [calendars],
  )

  const dayShortNames = useMemo(
    () => createWeekdayShortNames(tWeekdays),
    [tWeekdays],
  )

  const dayFullNames: Record<string, string> = {
    Sun: tWeekdays('sunday'),
    Mon: tWeekdays('monday'),
    Tue: tWeekdays('tuesday'),
    Wed: tWeekdays('wednesday'),
    Thu: tWeekdays('thursday'),
    Fri: tWeekdays('friday'),
    Sat: tWeekdays('saturday'),
  }

  const summarySlot = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {summary.mostActiveDay && (
        <>
          <ChartSummaryItem
            label={t('mostActive')}
            value={dayFullNames[summary.mostActiveDay] ?? summary.mostActiveDay}
          />
          <Badge variant="outline">
            {numberWithCommas(summary.mostActiveDayCount)} {t('contributions')}
          </Badge>
        </>
      )}
    </div>
  )

  return (
    <ChartCard
      icon={<CalendarDaysIcon className="size-5" />}
      isLoading={isLoading}
      summarySlot={summarySlot}
      title={t('weeklyDistribution', { year })}
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
            dataKey="day"
            fontSize={12}
            stroke="var(--color-muted-foreground)"
            tickFormatter={(value: string) => {
              return dayShortNames[value as WeekdayAbbr]
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
            content={<CustomTooltip contributionsLabel={t('contributions')} dayNames={dayFullNames} />}
            cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
          />
          <Bar
            animationDuration={800}
            dataKey="count"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry) => (
              <Cell
                key={entry.day}
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
