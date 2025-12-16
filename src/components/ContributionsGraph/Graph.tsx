import { memo, useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'

import { GraphTooltip } from '~/components/ContributionsGraph/GraphTooltip'
import { GraphTooltipLabel } from '~/components/ContributionsGraph/GraphTooltipLabel'
import { Button } from '~/components/ui/button'
import { DEFAULT_SIZE, levels } from '~/constants'
import { useData } from '~/DataContext'
import { ContributionLevel } from '~/enums'
import { numberWithCommas } from '~/helpers'
import { cn } from '~/lib/utils'
import type { ContributionCalendar, ContributionDay, GraphSettings } from '~/types'

import styles from './Graph.module.css'

export interface GraphProps extends React.ComponentProps<'div'> {
  data: ContributionCalendar
  daysLabel?: boolean
  weekLabel?: boolean
  showInspect?: boolean
  highlightedDates?: Set<string>
  settingsSize?: GraphSettings['size']
  titleRender?: (params: {
    year: number
    total: number
    isNewYear: boolean
  }) => React.ReactNode | null
}

function InnerGraph(props: GraphProps) {
  const {
    data: calendar,
    daysLabel,
    showInspect = true,
    titleRender,
    highlightedDates,
    settingsSize,
    ...rest
  } = props

  const { username } = useData()
  const t = useTranslations('graph')
  const tMonths = useTranslations('months')
  const tWeekdays = useTranslations('weekdays')

  const [isNewYear, setIsNewYear] = useState(false)

  useEffect(() => {
    const checkNewYear = () => {
      const now = Date.now()
      const currentYear = new Date(now).getFullYear()
      const isNew = currentYear === calendar.year
        && (new Date(currentYear, 0, 2).getTime() - now) / 1000 / 60 / 60 / 24 >= 0

      setIsNewYear(isNew)
    }

    checkNewYear()

    const interval = setInterval(checkNewYear, 60000)

    return () => {
      clearInterval(interval)
    }
  }, [calendar.year])

  const [tooltipInfo, setTooltipInfo] = useState<ContributionDay>()
  const [refEle, setRefEle] = useState<HTMLElement | null>(null)
  const delayTimer = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = useEvent((refTarget: HTMLElement, info: ContributionDay) => {
    delayTimer.current = setTimeout(() => {
      setRefEle(refTarget)
      setTooltipInfo(info)
    }, 50)
  })

  const handleMouseLeave = useEvent(() => {
    if (delayTimer.current) {
      window.clearTimeout(delayTimer.current)
    }

    setRefEle(null)
  })

  const shouldDimNonHighlighted = highlightedDates && highlightedDates.size > 0

  // 使用传入的 settingsSize，如果没有则使用默认值
  const currentSize = settingsSize ?? DEFAULT_SIZE

  return (
    <div {...rest} className={cn('group', rest.className)}>
      <div className="mb-2 flex items-center">
        {typeof titleRender === 'function'
          ? (
              titleRender({
                year: calendar.year,
                total: calendar.total,
                isNewYear,
              })
            )
          : (
              <div className="text-sm tabular-nums">
                <span className="mr-2 font-medium">{calendar.year}:</span>
                <span className="opacity-80">
                  {isNewYear && calendar.total === 0
                    ? t('newYearText')
                    : `${numberWithCommas(calendar.total)} ${t('contributions')}`}
                </span>
              </div>
            )}

        {showInspect && (
          <Button
            className="ml-auto opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground"
            render={(props) => (
              <Link
                href={`/year/${calendar.year}/${username}`}
                target="_blank"
                {...props}
              />
            )}
            size="xs"
            variant="outline"
          >
            {t('inspect')}
            <ChevronRight className="size-3" strokeWidth={2.5} />
          </Button>
        )}
      </div>

      <GraphTooltip
        label={
          tooltipInfo
            ? (
                <GraphTooltipLabel
                  count={tooltipInfo.count}
                  date={tooltipInfo.date}
                  size={currentSize}
                />
              )
            : null
        }
        refElement={refEle}
      />

      <div className={styles.graph}>
        {/* Months Label */}
        <ul className={styles.months}>
          <li>{tMonths('jan')}</li>
          <li>{tMonths('feb')}</li>
          <li>{tMonths('mar')}</li>
          <li>{tMonths('apr')}</li>
          <li>{tMonths('may')}</li>
          <li>{tMonths('jun')}</li>
          <li>{tMonths('jul')}</li>
          <li>{tMonths('aug')}</li>
          <li>{tMonths('sep')}</li>
          <li>{tMonths('oct')}</li>
          <li>{tMonths('nov')}</li>
          <li>{tMonths('dec')}</li>
        </ul>

        {/* Days Label */}
        {daysLabel && (
          <ul className={styles.days}>
            <li>{tWeekdays('sun')}</li>
            <li>{tWeekdays('mon')}</li>
            <li>{tWeekdays('tue')}</li>
            <li>{tWeekdays('wed')}</li>
            <li>{tWeekdays('thu')}</li>
            <li>{tWeekdays('fri')}</li>
            <li>{tWeekdays('sat')}</li>
          </ul>
        )}

        {/* Day Blocks */}
        <ul className={cn(styles.grids, styles.blocks)}>
          {calendar.weeks.reduce<React.ReactElement[]>((blocks, week, i) => {
            let days = week.days

            if (days.length < 7) {
              const fills = Array.from(Array(7 - days.length)).map<ContributionDay>(() => ({
                level: ContributionLevel.Null,
                count: 0,
                date: '',
              }))

              if (i === 0) {
                days = [...fills, ...week.days]
              }
              else {
                days = [...week.days, ...fills]
              }
            }

            days.forEach((day, j) => {
              const isHighlighted = day.date
                ? highlightedDates?.has(day.date) ?? false
                : false

              blocks.push(
                <li
                  key={day.date || `fill-${i}-${j}`}
                  className={cn(
                    'transition-all',
                    shouldDimNonHighlighted
                      ? (isHighlighted
                          ? 'opacity-100 shadow-xs'
                          : 'opacity-15')
                      : null,
                  )}
                  data-level={levels[day.level]}
                  onMouseEnter={(ev) => {
                    handleMouseEnter(ev.currentTarget, day)
                  }}
                  onMouseLeave={handleMouseLeave}
                />,
              )
            })

            return blocks
          }, [])}
        </ul>
      </div>
    </div>
  )
}

export const Graph = memo(InnerGraph, (prevProps, nextProps) => {
  if (prevProps.data.year !== nextProps.data.year) {
    return false
  }

  if (prevProps.data.total !== nextProps.data.total) {
    return false
  }

  if (prevProps.data.weeks.length !== nextProps.data.weeks.length) {
    return false
  }

  if (prevProps.daysLabel !== nextProps.daysLabel) {
    return false
  }

  if (prevProps.showInspect !== nextProps.showInspect) {
    return false
  }

  if (prevProps.settingsSize !== nextProps.settingsSize) {
    return false
  }

  if (prevProps.className !== nextProps.className) {
    return false
  }

  const prevHighlighted = prevProps.highlightedDates
  const nextHighlighted = nextProps.highlightedDates

  if (prevHighlighted !== nextHighlighted) {
    if (!prevHighlighted && !nextHighlighted) {
      return true
    }

    if (!prevHighlighted || !nextHighlighted) {
      return false
    }

    if (prevHighlighted.size !== nextHighlighted.size) {
      return false
    }

    for (const date of prevHighlighted) {
      if (!nextHighlighted.has(date)) {
        return false
      }
    }
  }

  if (prevProps.titleRender !== nextProps.titleRender) {
    return false
  }

  return true
})
