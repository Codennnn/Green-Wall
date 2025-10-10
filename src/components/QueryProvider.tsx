'use client'

import { useState } from 'react'

import { QueryClient, type QueryClientConfig, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // 数据保持新鲜的时间
      staleTime: 10 * 60 * 1000,
      // 缓存时间
      gcTime: 30 * 60 * 1000,
      // 全局不进行失败重试；在具体查询中按需设置 retry
      retry: false,
      // 窗口重新获得焦点时重新获取数据
      refetchOnWindowFocus: true,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
      // 组件挂载时重新获取数据
      refetchOnMount: 'always',
    },
    mutations: {
      // 全局不进行失败重试；在具体变更中按需设置 retry
      retry: false,
    },
  },
}

export function QueryProvider(props: React.PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient(queryClientConfig))

  return (
    <QueryClientProvider client={queryClient}>
      {props.children}

      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
