import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ChevronRight } from 'lucide-react'

import { GraphSvgBlocks } from '~/components/ContributionsGraph/GraphSvgBlocks'
import { GraphTooltip } from '~/components/ContributionsGraph/GraphTooltip'
import { GraphTooltipLabel } from '~/components/ContributionsGraph/GraphTooltipLabel'
import { Button } from '~/components/ui/button'
import { DEFAULT_BLOCK_SHAPE } from '~/constants'
import { useData } from '~/DataContext'
import type { BlockShape } from '~/enums'
import { numberWithCommas } from '~/helpers'
import { cn } from '~/lib/utils'
import type { ContributionCalendar, ContributionDay } from '~/types'

import styles from './Graph.module.css'

export interface GraphProps extends React.ComponentProps<'div'> {
  data: ContributionCalendar
  daysLabel?: boolean
  showInspect?: boolean
  highlightedDates?: Set<string>
  blockShape?: BlockShape
  computedColors?: string[]
  titleRender?: ((params: {
    year: number
    total: number
    isNewYear: boolean
  }) => React.ReactNode) | null
}

/**
 * Graph 组件 - 显示单年的 GitHub 贡献热力图
 */
export function Graph(props: GraphProps) {
  const {
    data: calendar,
    daysLabel,
    showInspect = true,
    titleRender,
    highlightedDates,
    blockShape,
    computedColors,
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
  const [refEle, setRefEle] = useState<Element | null>(null)
  const delayTimer = useRef<NodeJS.Timeout | null>(null)

  const handleDayHover = useEvent(
    (day: ContributionDay | null, element: SVGRectElement | null) => {
      if (delayTimer.current) {
        window.clearTimeout(delayTimer.current)
        delayTimer.current = null
      }

      if (day && element) {
        delayTimer.current = setTimeout(() => {
          setRefEle(element)
          setTooltipInfo(day)
        }, 50)
      }
      else {
        setRefEle(null)
        setTooltipInfo(undefined)
      }
    },
  )

  const renderTitle = () => {
    if (titleRender === null) {
      return null
    }

    if (typeof titleRender === 'function') {
      return titleRender({
        year: calendar.year,
        total: calendar.total,
        isNewYear,
      })
    }

    return (
      <div className="text-sm tabular-nums">
        <span className="mr-2 font-medium">{calendar.year}:</span>
        <span className="opacity-80">
          {isNewYear && calendar.total === 0
            ? t('newYearText')
            : `${numberWithCommas(calendar.total)} ${t('contributions')}`}
        </span>
      </div>
    )
  }

  return (
    <div {...rest} className={cn('group', rest.className)}>
      <div className="mb-2 flex items-center">
        {renderTitle()}

        {showInspect && (
          <Button
            className="group/inspect ml-auto transition-all opacity-0 group-hover:opacity-60 hover:opacity-100"
            render={(props) => (
              <Link
                href={`/year/${calendar.year}/${username}`}
                target="_blank"
                {...props}
              />
            )}
            size="xs"
            variant="ghost"
          >
            {t('inspect')}
            <ChevronRight className="size-3 transition-transform group-hover/inspect:translate-x-0.5" strokeWidth={2.5} />
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
        <GraphSvgBlocks
          blockShape={blockShape ?? DEFAULT_BLOCK_SHAPE}
          computedColors={computedColors}
          highlightedDates={highlightedDates}
          weeks={calendar.weeks}
          onDayHover={handleDayHover}
        />
      </div>
    </div>
  )
}
