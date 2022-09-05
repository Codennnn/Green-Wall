import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef } from 'react'

import themes from '../../themes'
import type { GraphData, GraphSettings, GraphSize, Theme } from '../../types'
import Graph from './Graph'
import GraphFooter from './GraphFooter'
import GraphHeader from './GraphHeader'

const variantsMap: Record<
  GraphSize,
  {
    ['--block-size']: string
    ['--block-round']: string
    ['--block-gap']: string
  }
> = {
  normal: {
    ['--block-size']: '10px',
    ['--block-round']: '2px',
    ['--block-gap']: '3px',
  },
  medium: {
    ['--block-size']: '11px',
    ['--block-round']: '3px',
    ['--block-gap']: '3px',
  },
  large: {
    ['--block-size']: '12px',
    ['--block-round']: '3px',
    ['--block-gap']: '4px',
  },
}

interface ContributionsGraphProps {
  className?: string
  data: GraphData
  theme?: Theme['name']
  settings?: GraphSettings
}

function ContributionsGraph(props: ContributionsGraphProps, ref: React.Ref<HTMLDivElement | null>) {
  const { className = '', data, theme, settings } = props

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

  const variants = variantsMap[settings?.size || 'normal']

  return (
    <div
      ref={graphRef}
      className={`p-5 ${className}`}
      style={{
        ...variants,
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

      {!(settings?.showOrigin === false) && <GraphFooter />}
    </div>
  )
}

export default memo(forwardRef(ContributionsGraph))
