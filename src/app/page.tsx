import { Suspense } from 'react'

import { DataProvider } from '~/DataContext'

import { HomePage } from './HomePage'

export default function IndexPage() {
  return (
    <DataProvider key="home">
      <Suspense fallback={null}>
        <HomePage />
      </Suspense>
    </DataProvider>
  )
}
