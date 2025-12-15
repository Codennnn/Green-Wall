'use client'

import { useMemo } from 'react'

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

import { getMonthlyChartData, type MonthlyChartData } from './chart-utils'
import { ChartCard, ChartSummaryItem } from './ChartCard'

interface CustomTooltipProps {
  active?: boolean
  payload?: { payload: MonthlyChartData }[]
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="font-medium text-popover-foreground text-sm">
        {data.month}
      </p>
      <p className="text-muted-foreground text-xs">
        {numberWithCommas(data.count)} contributions
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

  const { data, summary } = useMemo(
    () => getMonthlyChartData(calendars),
    [calendars],
  )

  const summarySlot = (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      <ChartSummaryItem
        label="Total"
        value={numberWithCommas(summary.totalContributions)}
      />
      {summary.maxMonth && (
        <Badge size="sm" variant="outline">
          Peak: {summary.maxMonth}
        </Badge>
      )}
    </div>
  )

  return (
    <ChartCard
      icon={<CalendarRangeIcon className="size-5" />}
      isLoading={isLoading}
      summarySlot={summarySlot}
      title={`Monthly Distribution in ${year}`}
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
            content={<CustomTooltip />}
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
