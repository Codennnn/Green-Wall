'use client'

import { useEffect } from 'react'

import Image from 'next/image'
import { useParams } from 'next/navigation'

import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import { useData } from '~/DataContext'
import { useGraphRequest } from '~/hooks/useGraphRequest'

export function UserPage() {
  const { graphData, setGraphData } = useData()

  const { run, loading, error } = useGraphRequest()

  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : undefined

  useEffect(() => {
    if (username) {
      void (async () => {
        const data = await run({ username })
        setGraphData(data)
      })()
    }
  }, [username, run, setGraphData])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-main-400">
        <Image priority alt="loading" height={60} src="/mona-loading-default.gif" width={60} />
        <span className="bg-white px-3 py-4">Loading contributions...</span>
      </div>
    )
  }

  if (graphData) {
    return (
      <div className="py-10 md:py-14">
        <div className="flex w-full overflow-x-auto py-5 md:justify-center md:py-14">
          <ContributionsGraph mockupClassName="md:shadow-2xl md:shadow-main-200" />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorMessage errorType={error.errorType} text={error.message} />
  }

  return null
}
