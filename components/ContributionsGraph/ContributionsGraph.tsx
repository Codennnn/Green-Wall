import { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'

import themes from '../../themes'
import type { GraphData, Theme } from '../../types'
import Graph from './Graph'
import GraphFooter from './GraphFooter'
import GraphHeader from './GraphHeader'

interface ContributionsGraphProps {
  className?: string
  data: GraphData
  theme?: Theme['name']
}

function ContributionsGraph(props: ContributionsGraphProps, ref: React.Ref<HTMLDivElement | null>) {
  const { className = '', data, theme } = props

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => graphRef.current)

  useEffect(() => {
    if (theme) {
      const applyedTheme = themes.find((item) => item.name.toLowerCase() === theme.toLowerCase())

      if (graphRef.current && applyedTheme) {
        graphRef.current.style.setProperty('--graph-text-color', applyedTheme.textColor)
        graphRef.current.style.setProperty('--graph-bg', applyedTheme.background)
        applyedTheme.levelColors.forEach((color, i) => {
          graphRef.current!.style.setProperty(`--level-${i}`, color)
        })
      }
    }
  }, [theme])

  return (
    <div
      ref={graphRef}
      className={`p-5 ${className}`}
      id="contributions-graph"
      style={{
        color: 'var(--graph-text-color, #24292f)',
        backgroundColor: 'var(--graph-bg, #fff)',
      }}
    >
      <GraphHeader username={data.username} />

      <div className="flex flex-col gap-y-6">
        {data.data?.map((data, i) => (
          <Graph key={`${i}`} data={data} />
        ))}
      </div>

      <GraphFooter />
    </div>
  )
}

export default memo(forwardRef(ContributionsGraph))
