'use client'

import { useTheme } from 'next-themes'

import { DataProvider } from '~/DataContext'

import { GraphBlock } from './GraphBlock'

export default function YearPageContent() {
  const { theme } = useTheme()

  return (
    <DataProvider
      overrideSettings={{
        showAttribution: false,
        theme: theme === 'dark' ? 'Midnight' : 'GreenWall',
      }}
    >
      <GraphBlock />
    </DataProvider>
  )
}
