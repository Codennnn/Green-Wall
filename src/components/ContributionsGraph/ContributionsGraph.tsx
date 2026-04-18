import {
  type CSSProperties,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'

import { MockupSafari } from '~/components/mockup/MockupSafari'
import { getThemeProperties } from '~/components/ThemeVariablesProvider'
import { DEFAULT_SIZE, sizeProperties } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape } from '~/enums'
import { useComputedLevelColors } from '~/hooks/useComputedLevelColors'
import { cn } from '~/lib/utils'
import type { ContributionCalendar } from '~/types'

import { Graph, type GraphProps } from './Graph'
import { GraphFooter } from './GraphFooter'
import { GraphHeader } from './GraphHeader'
import {
  calculateHighlightDates,
  flattenAndSortDays,
  type GraphHighlightMode,
  type GraphHighlightOptions,
} from './graphHighlightUtils'

type GraphCssProperties = CSSProperties & Record<`--${string}`, string>

interface VisibleYearRange {
  startYear: number
  endYear: number
}

interface ContributionsGraphProps
  extends Pick<GraphProps, 'showInspect' | 'titleRender'> {
  /** Unique ID for the contributions graph container. */
  wrapperId?: string
  wrapperClassName?: string
  /**
   * Custom Mockup component to wrap the contributions graph.
   * @default MockupArc
   */
  Mockup?: React.ComponentType<React.ComponentProps<typeof MockupSafari>>
  mockupWrapperClassName?: string
  mockupClassName?: string
  highlightMode?: GraphHighlightMode
  highlightOptions?: GraphHighlightOptions
}

function getGlobalMaxContributionCount(
  calendars: ContributionCalendar[],
): number {
  let max = 0

  for (const calendar of calendars) {
    for (const week of calendar.weeks) {
      for (const day of week.days) {
        if (day.count > max) {
          max = day.count
        }
      }
    }
  }

  return max
}

function getHighlightDatesByYear(
  calendars: ContributionCalendar[],
  highlightMode: GraphHighlightMode | undefined,
  highlightOptions: GraphHighlightOptions | undefined,
): Map<number, Set<string>> | undefined {
  if (!highlightMode || highlightMode === 'none') {
    return undefined
  }

  const map = new Map<number, Set<string>>()

  for (const calendar of calendars) {
    const daysInYear = flattenAndSortDays(calendar.weeks)
    const highlightedDates = calculateHighlightDates(
      daysInYear,
      highlightMode,
      highlightOptions,
    )

    if (highlightedDates.size > 0) {
      map.set(calendar.year, highlightedDates)
    }
  }

  return map
}

function toYear(value: string | undefined, fallback: number): number {
  const year = Number(value)

  return Number.isInteger(year) ? year : fallback
}

function getCalendarYearBounds(
  calendars: ContributionCalendar[],
): VisibleYearRange {
  let startYear = Number.POSITIVE_INFINITY
  let endYear = Number.NEGATIVE_INFINITY

  for (const calendar of calendars) {
    if (calendar.year < startYear) {
      startYear = calendar.year
    }

    if (calendar.year > endYear) {
      endYear = calendar.year
    }
  }

  return {
    startYear: Number.isFinite(startYear) ? startYear : 0,
    endYear: Number.isFinite(endYear) ? endYear : 0,
  }
}

function getVisibleYearRange(
  yearRange: [string | undefined, string | undefined] | undefined,
  firstYear: string | undefined,
  lastYear: string | undefined,
  fallbackRange: VisibleYearRange,
): VisibleYearRange {
  const [startYearValue, endYearValue] = yearRange ?? []

  return {
    startYear: toYear(startYearValue ?? firstYear, fallbackRange.startYear),
    endYear: toYear(endYearValue ?? lastYear, fallbackRange.endYear),
  }
}

function isCalendarVisible(
  calendarYear: number,
  range: VisibleYearRange,
): boolean {
  return calendarYear >= range.startYear && calendarYear <= range.endYear
}

/**
 * ContributionsGraph - 完整的 GitHub 贡献图组件
 */
function ContributionsGraphInner(
  props: ContributionsGraphProps,
  ref: React.Ref<HTMLDivElement | null>,
) {
  const {
    wrapperId,
    wrapperClassName,
    mockupWrapperClassName,
    mockupClassName,
    showInspect,
    titleRender,
    highlightMode,
    highlightOptions,
    Mockup = MockupSafari,
  } = props

  const {
    applyingTheme,
    graphData,
    settings,
    firstYear,
    lastYear,
    username,
  } = useData()

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    ref,
    () => graphRef.current,
  )

  const computedColors = useComputedLevelColors(graphRef, applyingTheme)

  const highlightMaxGapDays = highlightOptions?.maxGapDays
  const highlightSpecificDate = highlightOptions?.specificDate
  const highlightSpecificMonth = highlightOptions?.specificMonth
  const highlightLongestGapStart = highlightOptions?.longestGapRange?.start
  const highlightLongestGapEnd = highlightOptions?.longestGapRange?.end

  const globalMax = useMemo(() => {
    if (!graphData || !settings.globalScale) {
      return undefined
    }

    return getGlobalMaxContributionCount(graphData.contributionCalendars)
  }, [graphData, settings.globalScale])

  const highlightDatesByYear = useMemo(() => {
    if (!graphData || !highlightMode || highlightMode === 'none') {
      return undefined
    }

    const options: GraphHighlightOptions = {
      maxGapDays: highlightMaxGapDays,
      specificDate: highlightSpecificDate,
      specificMonth: highlightSpecificMonth,
      longestGapRange: {
        start: highlightLongestGapStart,
        end: highlightLongestGapEnd,
      },
    }

    return getHighlightDatesByYear(
      graphData.contributionCalendars,
      highlightMode,
      options,
    )
  }, [
    graphData,
    highlightMode,
    highlightMaxGapDays,
    highlightSpecificDate,
    highlightSpecificMonth,
    highlightLongestGapStart,
    highlightLongestGapEnd,
  ])

  if (!graphData) {
    return null
  }

  const fallbackYearRange = getCalendarYearBounds(
    graphData.contributionCalendars,
  )
  const visibleYearRange = getVisibleYearRange(
    settings.yearRange,
    firstYear,
    lastYear,
    fallbackYearRange,
  )
  const themeProperties = applyingTheme
    ? getThemeProperties(applyingTheme)
    : {}

  const cssProperties: GraphCssProperties = {
    ...themeProperties,
    ...sizeProperties[settings.size ?? DEFAULT_SIZE],
    ...(settings.blockShape === BlockShape.Round
      ? {
          '--block-round': '999px',
        }
      : {}),
  }

  return (
    <div
      ref={graphRef}
      className={wrapperClassName}
      id={wrapperId}
      style={{
        ...cssProperties,
        color: 'var(--theme-foreground, #24292f)',
      }}
    >
      <Mockup
        className={mockupClassName}
        wrapperClassName={mockupWrapperClassName}
      >
        <div>
          <div
            className={cn('px-6', settings.showSafariHeader ? 'pt-2' : 'pt-6')}
          >
            <GraphHeader />
          </div>

          <div className="flex flex-col gap-y-6 p-6">
            {graphData.contributionCalendars.map((calendar) => {
              const shouldDisplay = isCalendarVisible(
                calendar.year,
                visibleYearRange,
              )
              const highlightedDates = highlightDatesByYear?.get(calendar.year)

              return (
                <Graph
                  key={calendar.year}
                  blockShape={settings.blockShape}
                  className={shouldDisplay ? '' : 'hidden'}
                  computedColors={computedColors}
                  data={calendar}
                  daysLabel={settings.daysLabel}
                  globalMax={globalMax}
                  highlightedDates={highlightedDates}
                  showInspect={showInspect}
                  titleRender={titleRender}
                  username={username}
                />
              )
            })}
          </div>

          {settings.showAttribution
            ? (
                <div className="border-t-[1.5px] border-t-[color-mix(in_srgb,var(--theme-border)_50%,transparent)] px-6 py-3">
                  <GraphFooter />
                </div>
              )
            : null}
        </div>
      </Mockup>
    </div>
  )
}

export const ContributionsGraph = forwardRef(ContributionsGraphInner)
