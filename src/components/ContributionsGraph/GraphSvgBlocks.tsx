'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { DEFAULT_LEVEL_COLORS, levels, SVG_GRAPH_CONSTANTS } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape, ContributionLevel } from '~/enums'
import { cn, rgbToHex } from '~/lib/utils'
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
  highlightedDates?: Set<string>
  onDayHover?: (day: ContributionDay | null, element: SVGRectElement | null) => void
}

/**
 * GraphSvgBlocks - 渲染 SVG 贡献热力图方块
 */
export function GraphSvgBlocks({
  weeks,
  highlightedDates,
  onDayHover,
}: GraphSvgBlocksProps) {
  const { settings, applyingTheme } = useData()
  const shouldDimNonHighlighted = highlightedDates && highlightedDates.size > 0
  const svgRef = useRef<SVGSVGElement>(null)

  // 存储计算后的实际颜色值（用于图片导出）
  const [computedColors, setComputedColors] = useState<string[]>(DEFAULT_LEVEL_COLORS)

  // 根据 blockShape 设置圆角值（使用 viewBox 单位）
  const blockRadius = settings.blockShape === BlockShape.Round
    ? CORNER_RADIUS_ROUND
    : CORNER_RADIUS_SQUARE

  // 计算 viewBox 尺寸
  const totalWeeks = weeks.length
  const viewBoxWidth = totalWeeks * CELL_UNIT
  const viewBoxHeight = DAYS_IN_WEEK * CELL_UNIT

  useEffect(() => {
    if (!svgRef.current) {
      return
    }

    const svg = svgRef.current
    const computedStyle = getComputedStyle(svg)
    const colors: string[] = []

    for (let i = 0; i <= 4; i++) {
      const cssVar = computedStyle.getPropertyValue(`--level-${i}`).trim()

      if (cssVar) {
        // 创建临时元素来解析可能包含 color-mix() 的颜色值
        const tempDiv = document.createElement('div')
        tempDiv.style.cssText = `color: ${cssVar}; display: none;`
        document.body.appendChild(tempDiv)

        const resolved = getComputedStyle(tempDiv).color
        document.body.removeChild(tempDiv)

        colors.push(rgbToHex(resolved))
      }
      else {
        colors.push(DEFAULT_LEVEL_COLORS[i])
      }
    }

    setComputedColors(colors)
  }, [applyingTheme])

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
      ref={svgRef}
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
