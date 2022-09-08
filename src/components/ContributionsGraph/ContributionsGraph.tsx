import { forwardRef, memo, useImperativeHandle, useMemo, useRef } from 'react'

import { DEFAULT_SIZE, DEFAULT_THEME, sizeProperties, THEMES } from '../../constants'
import type { GraphData, GraphSettings } from '../../types'
import Graph from './Graph'
import GraphFooter from './GraphFooter'
import GraphHeader from './GraphHeader'

interface ContributionsGraphProps {
  className?: string
  data: GraphData
  settings?: GraphSettings
}

function ContributionsGraph(props: ContributionsGraphProps, ref: React.Ref<HTMLDivElement | null>) {
  const { className = '', data, settings } = props

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => graphRef.current)

  const applyedTheme = useMemo(
    () =>
      THEMES.find(
        (item) => item.name.toLowerCase() === (settings?.theme || DEFAULT_THEME).toLowerCase()
      )!,
    [settings?.theme]
  )

  const themeProperties = {
    '--graph-text-color': applyedTheme.textColor,
    '--graph-bg': applyedTheme.background,
    '--level-0': applyedTheme.levelColors[0],
    '--level-1': applyedTheme.levelColors[1],
    '--level-2': applyedTheme.levelColors[2],
    '--level-3': applyedTheme.levelColors[3],
    '--level-4': applyedTheme.levelColors[4],
  }

  const cssProperties = { ...themeProperties, ...sizeProperties[settings?.size || DEFAULT_SIZE] }

  return (
    <div
      ref={graphRef}
      className={`p-5 ${className}`}
      style={{
        ...cssProperties,
        color: 'var(--graph-text-color, #24292f)',
        backgroundColor: 'var(--graph-bg, #fff)',
      }}
    >
      <GraphHeader username={data.username} />

      <div className="flex flex-col gap-y-6">
        {data.data?.map((data) => (
          <Graph key={data.year} data={data} />
        ))}
      </div>

      {!(settings?.showOrigin === false) && <GraphFooter />}
    </div>
  )
}

export default memo(forwardRef(ContributionsGraph))
