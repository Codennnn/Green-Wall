import { forwardRef, memo, useImperativeHandle, useMemo, useRef } from 'react'

import { MockupSafari } from '~/components/mockup/MockupSafari'
import { DEFAULT_SIZE, DEFAULT_THEME, sizeProperties, THEME_PRESETS } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape } from '~/enums'

import { Graph, type GraphProps } from './Graph'
import { GraphFooter } from './GraphFooter'
import { GraphHeader } from './GraphHeader'

interface ContributionsGraphProps extends Pick<GraphProps, 'showInspect' | 'titleRender'> {
  /** Unique ID for the contributions graph container. */
  wrapperId?: string
  /**
   * Custom Mockup component to wrap the contributions graph.
   * @default MockupArc
   */
  Mockup?: React.ComponentType<React.ComponentProps<typeof MockupSafari>>
  /** CSS class name to be applied to the Mockup component. */
  mockupClassName?: string
}

function InnerContributionsGraph(
  props: ContributionsGraphProps,
  ref: React.Ref<HTMLDivElement | null>
) {
  const { mockupClassName = '', wrapperId, showInspect, titleRender, Mockup = MockupSafari } = props

  const { graphData, settings, firstYear, lastYear } = useData()

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => graphRef.current!)

  const applyingTheme = useMemo(
    () =>
      THEME_PRESETS.find(
        (item) => item.name.toLowerCase() === (settings.theme ?? DEFAULT_THEME).toLowerCase()
      ),
    [settings.theme]
  )

  if (!graphData) {
    return null
  }

  const themeProperties = applyingTheme
    ? {
        '--theme-foreground': applyingTheme.colorForeground,
        '--theme-background': applyingTheme.colorBackground,
        '--theme-background-container': applyingTheme.colorBackgroundContainer,
        '--theme-secondary': applyingTheme.colorSecondary,
        '--theme-primary': applyingTheme.colorPrimary,
        '--theme-border': applyingTheme.colorBorder,
        '--level-0': applyingTheme.levelColors[0],
        '--level-1': applyingTheme.levelColors[1],
        '--level-2': applyingTheme.levelColors[2],
        '--level-3': applyingTheme.levelColors[3],
        '--level-4': applyingTheme.levelColors[4],
      }
    : {}

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
      <Mockup className={mockupClassName}>
        <div>
          <div className="px-6 pb-10">
            <GraphHeader />
          </div>

          <div className="flex flex-col gap-y-6 p-6">
            {graphData.contributionCalendars.map((calendar) => {
              let [startYear, endYear] = settings.yearRange ?? []
              startYear = startYear && Number.isInteger(Number(startYear)) ? startYear : firstYear
              endYear = endYear && Number.isInteger(Number(endYear)) ? endYear : lastYear

              const shouldDisplay =
                startYear && endYear
                  ? calendar.year >= Number(startYear) && calendar.year <= Number(endYear)
                  : true

              return (
                <Graph
                  key={calendar.year}
                  className={shouldDisplay ? '' : 'hidden'}
                  data={calendar}
                  daysLabel={settings.daysLabel}
                  showInspect={showInspect}
                  titleRender={titleRender}
                />
              )
            })}
          </div>

          {settings.showAttribution &&
            <div className="border-t-[1.5px] px-6 py-3 border-t-[color-mix(in_srgb,var(--theme-border)_50%,transparent)]">
              <GraphFooter />
            </div>
          }
        </div>
      </Mockup>
    </div>
  )
}

export const ContributionsGraph = memo(forwardRef(InnerContributionsGraph))
