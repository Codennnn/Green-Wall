'use client'

import { memo, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { levels } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape, ContributionLevel } from '~/enums'
import { cn } from '~/lib/utils'
import type { ContributionCalendar, ContributionDay } from '~/types'

import styles from './Graph.module.css'

// SVG 坐标常量（使用相对单位）
const CELL_UNIT = 1 // 每个单元格占 1 个单位
const BLOCK_RATIO = 0.77 // 方块大小占单元格的比例 (10 / 13 ≈ 0.77)

// 圆角常量（viewBox 单位）
const ROUND_SQUARE = 0.12 // 方形：小圆角
const ROUND_CIRCLE = BLOCK_RATIO / 2 // 圆形：半径为宽度的一半

export interface GraphSvgBlocksProps {
  weeks: ContributionCalendar['weeks']
  highlightedDates?: Set<string>
  onDayHover?: (day: ContributionDay | null, element: SVGRectElement | null) => void
}

function InnerGraphSvgBlocks({
  weeks,
  highlightedDates,
  onDayHover,
}: GraphSvgBlocksProps) {
  const { settings } = useData()
  const shouldDimNonHighlighted = highlightedDates && highlightedDates.size > 0

  // 根据 blockShape 设置圆角值（使用 viewBox 单位）
  const blockRadius = settings.blockShape === BlockShape.Round
    ? ROUND_CIRCLE
    : ROUND_SQUARE

  // 计算 viewBox 尺寸
  const totalWeeks = weeks.length
  const viewBoxWidth = totalWeeks * CELL_UNIT
  const viewBoxHeight = 7 * CELL_UNIT

  const rects = useMemo(() => {
    const elements: React.ReactElement[] = []

    weeks.forEach((week, weekIndex) => {
      let days = week.days

      // 填充不足 7 天的周
      if (days.length < 7) {
        const fills = Array.from(Array(7 - days.length)).map<ContributionDay>(
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
  }, [weeks, highlightedDates, shouldDimNonHighlighted, blockRadius])

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

export const GraphSvgBlocks = memo(
  InnerGraphSvgBlocks,
  (prevProps, nextProps) => {
    if (prevProps === nextProps) {
      return true
    }

    if (prevProps.weeks !== nextProps.weeks) {
      return false
    }

    if (prevProps.highlightedDates !== nextProps.highlightedDates) {
      return false
    }

    if (prevProps.onDayHover !== nextProps.onDayHover) {
      return false
    }

    return true
  },
)
