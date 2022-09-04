import splitbee from '@splitbee/web'
import html2canvas from 'html2canvas'
import Head from 'next/head'
import { type FormEventHandler, useEffect, useRef, useState } from 'react'

import ContributionsGraph from '../components/ContributionsGraph'
import ErrorMessage from '../components/ErrorMessage'
import GenerateButton from '../components/GenerateButton'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import ShareButton from '../components/ShareButton'
import ThemeSelector from '../components/ThemeSelector'
import mockData from '../mock-data'
import type { ErrorData, GraphData } from '../types'

export default function HomePage() {
  const graphRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const [username, setUsername] = useState('')
  const [graphData, setGraphData] = useState<GraphData>()
  const [theme, setTheme] = useState<string>()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ErrorData>()

  const handleDownload = async () => {
    if (graphRef.current && graphData) {
      splitbee.track('Click Download')
      const canvas = await html2canvas(graphRef.current, {
        backgroundColor: null,
      })
      const dataURL = canvas.toDataURL()

      const trigger = document.createElement('a')
      trigger.href = dataURL
      trigger.download = `${graphData.username}.png`
      trigger.click()
    }
  }

  const handleError = (errorData: ErrorData = {}) => {
    setGraphData(undefined)
    setError(errorData)
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (username && !loading) {
      splitbee.track('Click Generate')
      try {
        inputRef.current!.blur()
        setError(undefined)
        setLoading(true)
        const res = await fetch(`/api/${username}`)
        console.log(res)
        if (res.status >= 400) {
          const error: ErrorData = await res.json()
          console.log(error)
          handleError({ message: error.message })
        } else {
          const data: GraphData = await res.json()
          console.log(data)
          setGraphData(data)
        }
      } catch (e) {
        handleError()
      } finally {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    if (graphData && actionRef.current) {
      const offsetTop = actionRef.current.getBoundingClientRect().top
      if (offsetTop > 0) {
        window.scrollTo(0, offsetTop)
      }
    }
  }, [graphData])

  return (
    <>
      <Head>
        <title>Green Wall · Review your GitHub contributions</title>
      </Head>

      <div className="py-10 md:py-14">
        <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-6xl md:leading-[1.2]">
          Review the contributions you have made on GitHub over the years.
        </h1>

        <form className="py-12 md:py-16" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
            <input
              ref={inputRef}
              required
              className="inline-block h-[2.8rem] overflow-hidden rounded-lg bg-main-100 px-5 text-center text-lg font-medium text-main-800 text-opacity-80 caret-main-500 shadow-main-300 outline-none transition-all duration-300 placeholder:select-none placeholder:font-normal placeholder:text-main-400 focus:bg-white focus:shadow-[0_0_1.5rem_var(--tw-shadow-color)]"
              name="username"
              placeholder="GitHub Username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <GenerateButton loading={loading} type="submit" />
          </div>
        </form>

        {error ? (
          <ErrorMessage message={error.message} />
        ) : (
          <Loading active={loading}>
            {graphData && (
              <>
                <div ref={actionRef} className="flex items-center justify-center gap-x-6 py-5">
                  <ShareButton theme={theme} username={username} />
                  <button
                    className="inline-flex h-full items-center rounded-md bg-main-200 py-2 px-4 font-medium text-main-500 focus:outline-none disabled:cursor-default"
                    onClick={handleDownload}
                  >
                    Save as Image
                  </button>
                  <ThemeSelector
                    onChange={(theme) => {
                      splitbee.track('Change theme', { themeName: theme.name })
                      setTheme(theme.name)
                    }}
                  />
                </div>

                <div className="flex overflow-x-auto md:justify-center">
                  <ContributionsGraph ref={graphRef} data={graphData} theme={theme} />
                </div>
              </>
            )}
          </Loading>
        )}
      </div>
    </>
  )
}

HomePage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}
