'use client'

import { DataProvider } from '~/DataContext'

import { GraphBlock } from './GraphBlock'

export default function YearPageContent() {
  return (
    <div>
      <DataProvider>
        <GraphBlock />
      </DataProvider>
    </div>
  )
}
