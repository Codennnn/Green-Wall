import splitbee from '@splitbee/web'
import { toPng } from 'html-to-image'
import { type FormEventHandler, useEffect, useRef, useState } from 'react'

import AppearanceSetting from '../components/AppearanceSetting'
import ContributionsGraph from '../components/ContributionsGraph'
import ErrorMessage from '../components/ErrorMessage'
import GenerateButton from '../components/GenerateButton'
import { iconImage } from '../components/icons'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import SettingButton from '../components/SettingButton'
import ShareButton from '../components/ShareButton'
import TweetButton from '../components/TweetButton'
import mockData from '../mock-data'
import type { ErrorData, GraphRemoteData } from '../types'
import useSetting from '../useSetting'

export default function HomePage() {
  const graphRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const [username, setUsername] = useState('')
  const [settings, dispatch] = useSetting()

  const [downloading, setDownloading] = useState(false)

  const [graphData, setGraphData] = useState<GraphRemoteData>()
  const [error, setError] = useState<ErrorData>()

  const handleError = (errorData: ErrorData = {}) => {
    setGraphData(undefined)
    setError(errorData)
  }

  const [loading, setLoading] = useState(false)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (username && !loading) {
      splitbee.track('Click Generate')
      try {
        setError(undefined)
        setGraphData(undefined)
        setLoading(true)
        const res = await fetch(`/api/${username}`)
        if (res.status >= 400) {
          const error: ErrorData = await res.json()
          console.log(error)
          handleError({ message: error.message })
        } else {
          const data: GraphRemoteData = await res.json()
          setGraphData(data)
        }
      } catch (e) {
        handleError()
      } finally {
        setLoading(false)
      }
    }
  }

  const handleDownload = async () => {
    if (graphRef.current && graphData) {
      try {
        setDownloading(true)
        splitbee.track('Click Download')

        const dataURL = await toPng(graphRef.current)
        const trigger = document.createElement('a')
        trigger.href = dataURL
        trigger.download = `${graphData.username}_contributions`
        trigger.click()
      } finally {
        setTimeout(() => {
          setDownloading(false)
        }, 2000)
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
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-6xl md:leading-[1.2]">
        Review the contributions you have made on GitHub over the years.
      </h1>

      <form className="py-12 md:py-16" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
          <input
            ref={inputRef}
            required
            className="
              inline-block h-[2.8rem] overflow-hidden rounded-lg bg-main-100 px-5
              text-center text-lg font-medium text-main-600 caret-main-500 shadow-main-300 outline-none
              transition-all duration-300
              placeholder:select-none placeholder:font-normal placeholder:text-main-400
              focus:bg-white focus:shadow-[0_0_1.5rem_var(--tw-shadow-color)]
            "
            disabled={loading}
            name="username"
            placeholder="GitHub Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onFocus={() => inputRef.current?.select()}
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
              <div
                ref={actionRef}
                className="flex flex-row-reverse flex-wrap items-center justify-center gap-x-6 gap-y-4 py-5"
              >
                <button
                  className={`
                  inline-flex h-full items-center rounded-md bg-main-100 py-2 px-4 font-medium text-main-500
                  disabled:pointer-events-none
                  ${downloading ? 'animate-bounce' : ''}
                  `}
                  disabled={downloading}
                  onClick={handleDownload}
                >
                  <span className="mr-2 h-6 w-6">{iconImage}</span>
                  <span>Save as Image</span>
                </button>
                <div className="flex flex-wrap items-center gap-x-6 md:justify-center">
                  <TweetButton />
                  <ShareButton settings={settings} username={graphData.username} />
                  <SettingButton
                    content={<AppearanceSetting value={settings} onChange={dispatch} />}
                  />
                </div>
              </div>

              <div className="flex overflow-x-auto md:justify-center">
                <ContributionsGraph ref={graphRef} data={graphData} settings={settings} />
              </div>
            </>
          )}
        </Loading>
      )}
    </div>
  )
}

HomePage.getLayout = (page: React.ReactElement) => {
  return <Layout>{page}</Layout>
}
