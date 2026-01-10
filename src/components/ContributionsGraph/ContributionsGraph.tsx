import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

import { MockupSafari } from '~/components/mockup/MockupSafari'
import { getThemeProperties } from '~/components/ThemeVariablesProvider'
import { DEFAULT_SIZE, DEFAULT_THEME, sizeProperties, THEME_PRESETS } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape } from '~/enums'
import { useComputedLevelColors } from '~/hooks/useComputedLevelColors'
import { cn } from '~/lib/utils'

import { Graph, type GraphProps } from './Graph'
import { GraphFooter } from './GraphFooter'
import { GraphHeader } from './GraphHeader'
import {
  calculateHighlightDates,
  flattenAndSortDays,
  type GraphHighlightMode,
  type GraphHighlightOptions,
} from './graphHighlightUtils'

interface ContributionsGraphProps
  extends Pick<GraphProps, 'showInspect' | 'titleRender'> {
  /** Unique ID for the contributions graph container. */
  wrapperId?: string
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

/**
 * ContributionsGraph - 完整的 GitHub 贡献图组件
 */
function ContributionsGraphInner(
  props: ContributionsGraphProps,
  ref: React.Ref<HTMLDivElement | null>,
) {
  const {
    mockupWrapperClassName,
    mockupClassName,
    wrapperId,
    showInspect,
    titleRender,
    highlightMode,
    highlightOptions,
    Mockup = MockupSafari,
  } = props

  const { graphData, settings, firstYear, lastYear } = useData()

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(ref, () => graphRef.current)

  const applyingTheme = useMemo(
    () => {
      const targetTheme = settings.theme ?? DEFAULT_THEME

      return THEME_PRESETS.find(
        (item) => item.name.toLowerCase() === targetTheme.toLowerCase(),
      )
    },
    [settings.theme],
  )

  const computedColors = useComputedLevelColors(graphRef, applyingTheme)

  const highlightDatesMap = useMemo(() => {
    const map = new Map<number, Set<string>>()

    if (!graphData) {
      return map
    }

    graphData.contributionCalendars.forEach((calendar) => {
      const daysInYear = flattenAndSortDays(calendar.weeks)
      const highlightedDates = calculateHighlightDates(daysInYear, highlightMode, highlightOptions)
      map.set(calendar.year, highlightedDates)
    })

    return map
  }, [graphData, highlightMode, highlightOptions])

  if (!graphData) {
    return null
  }

  const themeProperties = applyingTheme ? getThemeProperties(applyingTheme) : {}

  const cssProperties = {
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
          <div className={cn('px-6', settings.showSafariHeader ? 'pt-2' : 'pt-6')}>
            <GraphHeader />
          </div>

          <div className="flex flex-col gap-y-6 p-6">
            {graphData.contributionCalendars.map((calendar) => {
              let [startYear, endYear] = settings.yearRange ?? []
              startYear = startYear && Number.isInteger(Number(startYear)) ? startYear : firstYear
              endYear = endYear && Number.isInteger(Number(endYear)) ? endYear : lastYear

              const shouldDisplay
                = startYear && endYear
                  ? calendar.year >= Number(startYear) && calendar.year <= Number(endYear)
                  : true

              const highlightedDates = highlightDatesMap.get(calendar.year)

              return (
                <Graph
                  key={calendar.year}
                  blockShape={settings.blockShape}
                  className={shouldDisplay ? '' : 'hidden'}
                  computedColors={computedColors}
                  data={calendar}
                  daysLabel={settings.daysLabel}
                  highlightedDates={highlightedDates}
                  showInspect={showInspect}
                  titleRender={titleRender}
                />
              )
            })}
          </div>

          {settings.showAttribution && (
            <div className="border-t-[1.5px] border-t-[color-mix(in_srgb,var(--theme-border)_50%,transparent)] px-6 py-3">
              <GraphFooter />
            </div>
          )}
        </div>
      </Mockup>
    </div>
  )
}

export const ContributionsGraph = forwardRef(ContributionsGraphInner)
