'use client'

import { useTheme } from 'next-themes'

import { DataProvider } from '~/DataContext'

import { GraphBlock } from './GraphBlock'

export default function YearPageContent() {
  const { resolvedTheme } = useTheme()

  return (
    <DataProvider
      overrideSettings={{
        showAttribution: false,
        theme: resolvedTheme === 'dark' ? 'Midnight' : 'GreenWall',
      }}
    >
      <GraphBlock />
    </DataProvider>
  )
}
