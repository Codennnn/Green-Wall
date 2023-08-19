import { DataProvider } from '~/DataContext'

import { HomePage } from './HomePage'

export default function IndexPage() {
  return (
    <DataProvider key="home">
      <HomePage />
    </DataProvider>
  )
}
