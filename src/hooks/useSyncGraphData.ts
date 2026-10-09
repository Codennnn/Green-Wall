'use client'

import { useLayoutEffect } from 'react'

import { replaceEqualDeep } from '@tanstack/react-query'

import { useData } from '~/DataContext'
import type { GraphData } from '~/types'

// 将查询结果同步到 DataContext。
// 用 useLayoutEffect：同步先于绘制，否则切换用户/年份命中缓存时会先渲染一帧上一份数据。
// 用 replaceEqualDeep：跨 queryKey 拿到内容相同的数据时保住引用，避免整棵贡献图重算。
export function useSyncGraphData(graphData: GraphData | undefined) {
  const { setGraphData } = useData()

  useLayoutEffect(() => {
    if (graphData === undefined) {
      setGraphData(undefined)

      return
    }

    setGraphData((previous) => replaceEqualDeep(previous, graphData))
  }, [graphData, setGraphData])
}
