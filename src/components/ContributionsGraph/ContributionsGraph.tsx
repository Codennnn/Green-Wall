import { forwardRef, memo, useImperativeHandle, useMemo, useRef } from 'react'

import { DEFAULT_SIZE, DEFAULT_THEME, sizeProperties, THEMES } from '~/constants'
import { useData } from '~/DataContext'

import { Graph, type GraphProps } from './Graph'
import { GraphFooter } from './GraphFooter'
import { GraphHeader } from './GraphHeader'

interface ContributionsGraphProps extends Pick<GraphProps, 'showInspect' | 'titleRender'> {
  className?: string
  wrapperId?: string
}

function InnerContributionsGraph(
  props: ContributionsGraphProps,
  ref: React.Ref<HTMLDivElement | null>
) {
  const { className = '', wrapperId, showInspect, titleRender } = props

  const { graphData, settings, firstYear, lastYear } = useData()

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => graphRef.current)

  const applyingTheme = useMemo(
    () =>
      THEMES.find(
        (item) => item.name.toLowerCase() === (settings.theme ?? DEFAULT_THEME).toLowerCase()
      )!,
    [settings.theme]
  )

  if (!graphData) {
    return null
  }

  const themeProperties = {
    '--graph-text-color': applyingTheme.textColor,
    '--graph-bg': applyingTheme.background,
    '--level-0': applyingTheme.levelColors[0],
    '--level-1': applyingTheme.levelColors[1],
    '--level-2': applyingTheme.levelColors[2],
    '--level-3': applyingTheme.levelColors[3],
    '--level-4': applyingTheme.levelColors[4],
  }

  const cssProperties = { ...themeProperties, ...sizeProperties[settings.size ?? DEFAULT_SIZE] }

  return (
    <div
      ref={graphRef}
      className={`-mx-5 flex flex-col items-center p-5 md:mx-0 ${className}`}
      id={wrapperId}
      style={{
        ...cssProperties,
        color: 'var(--graph-text-color, #24292f)',
        backgroundColor: 'var(--graph-bg, #fff)',
      }}
    >
      <GraphHeader />

      <div className="flex flex-col gap-y-6">
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
              showInspect={showInspect}
              titleRender={titleRender}
            />
          )
        })}
      </div>

      {!(settings.showAttribution === false) && <GraphFooter />}
    </div>
  )
}

export const ContributionsGraph = memo(forwardRef(InnerContributionsGraph))
