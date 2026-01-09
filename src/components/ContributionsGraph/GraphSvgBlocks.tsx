'use client'

import { useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { DEFAULT_LEVEL_COLORS, levels, SVG_GRAPH_CONSTANTS } from '~/constants'
import { BlockShape, ContributionLevel } from '~/enums'
import { cn } from '~/lib/utils'
import type { ContributionCalendar, ContributionDay } from '~/types'

import styles from './Graph.module.css'

const {
  DAYS_IN_WEEK,
  CELL_UNIT,
  BLOCK_RATIO,
  CORNER_RADIUS_SQUARE,
  CORNER_RADIUS_ROUND,
} = SVG_GRAPH_CONSTANTS

export interface GraphSvgBlocksProps {
  weeks: ContributionCalendar['weeks']
  blockShape: BlockShape
  computedColors?: string[]
  highlightedDates?: Set<string>
  onDayHover?: (day: ContributionDay | null, element: SVGRectElement | null) => void
}

/**
 * GraphSvgBlocks - 渲染 SVG 贡献热力图方块
 */
export function GraphSvgBlocks({
  weeks,
  blockShape,
  computedColors = DEFAULT_LEVEL_COLORS,
  highlightedDates,
  onDayHover,
}: GraphSvgBlocksProps) {
  const shouldDimNonHighlighted = highlightedDates && highlightedDates.size > 0

  const blockRadius = blockShape === BlockShape.Round
    ? CORNER_RADIUS_ROUND
    : CORNER_RADIUS_SQUARE

  const totalWeeks = weeks.length
  const viewBoxWidth = totalWeeks * CELL_UNIT
  const viewBoxHeight = DAYS_IN_WEEK * CELL_UNIT

  const rects = useMemo(() => {
    const elements: React.ReactElement[] = []

    weeks.forEach((week, weekIndex) => {
      let days = week.days

      // 填充不足一周天数的周（首周在前面填充，末周在后面填充）
      if (days.length < DAYS_IN_WEEK) {
        const fillCount = DAYS_IN_WEEK - days.length
        const fills = Array.from({ length: fillCount }).map<ContributionDay>(
          () => ({
            level: ContributionLevel.Null,
            count: 0,
            date: '',
          }),
        )

        if (weekIndex === 0) {
          days = [...fills, ...week.days]
        }
        else {
          days = [...week.days, ...fills]
        }
      }

      days.forEach((day, dayIndex) => {
        const isHighlighted = day.date
          ? highlightedDates?.has(day.date) ?? false
          : false

        const level = levels[day.level]
        const isNull = level === -1

        const fillColor = level >= 0 && level <= 4
          ? computedColors[level]
          : 'transparent'

        elements.push(
          <rect
            key={day.date || `fill-${weekIndex}-${dayIndex}`}
            className={cn(
              styles.svgRect,
              shouldDimNonHighlighted && !isNull
                ? isHighlighted
                  ? styles.highlighted
                  : styles.dimmed
                : null,
            )}
            data-count={day.count}
            data-date={day.date}
            data-level={level}
            data-level-key={day.level}
            fill={fillColor}
            height={BLOCK_RATIO}
            rx={blockRadius}
            ry={blockRadius}
            width={BLOCK_RATIO}
            x={weekIndex * CELL_UNIT}
            y={dayIndex * CELL_UNIT}
          />,
        )
      })
    })

    return elements
  }, [weeks, highlightedDates, shouldDimNonHighlighted, blockRadius, computedColors])

  const handleMouseMove = useEvent((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGRectElement

    if (target.tagName !== 'rect' || !target.dataset.date) {
      return
    }

    const day: ContributionDay = {
      date: target.dataset.date,
      count: Number(target.dataset.count || 0),
      level: target.dataset.levelKey as ContributionLevel,
    }

    onDayHover?.(day, target)
  })

  const handleMouseLeave = useEvent(() => {
    onDayHover?.(null, null)
  })

  return (
    <svg
      className={styles.svgBlocks}
      preserveAspectRatio="xMinYMin meet"
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {rects}
    </svg>
  )
}
