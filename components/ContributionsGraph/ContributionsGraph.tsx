import { forwardRef, memo, useImperativeHandle, useRef } from 'react'

import type { GraphData } from '../../types'
import Graph from './Graph'
import GraphFooter from './GraphFooter'
import GraphHeader from './GraphHeader'

interface ContributionsGraphProps {
  className?: string
  data: GraphData
}

function ContributionsGraph(props: ContributionsGraphProps, ref: React.Ref<HTMLDivElement | null>) {
  const { className = '', data } = props

  const graphRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => graphRef.current)

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
