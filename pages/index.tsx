import html2canvas from 'html2canvas'
import Head from 'next/head'
import { type FormEventHandler, useEffect, useRef, useState } from 'react'

import Graph from '../components/Graph'
import GraphFooter from '../components/GraphFooter'
import GraphHeader from '../components/GraphHeader'
import Loading from '../components/Loading'
import ThemeSelector from '../components/ThemeSelector'
import mockData from '../mock-data'
import type { GraphData } from '../types'

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const [username, setUsername] = useState('')
  const [graphData, setGraphData] = useState<GraphData>()
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (container.current && graphData) {
      const canvas = await html2canvas(container.current, {
        backgroundColor: null,
      })
      const dataURL = canvas.toDataURL()

      const trigger = document.createElement('a')
      trigger.href = dataURL
      trigger.download = `${graphData.username}.png`
      trigger.click()
    }
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    if (username) {
      try {
        inputRef.current!.blur()
        setLoading(true)
        const res = await fetch(`/api/${username}`)
        const data: GraphData = await res.json()
        console.log(data)
        setGraphData(data)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <>
      <Head>
        <title>Green Wall · Review your GitHub contributions</title>
      </Head>

      <div className="min-h-full md:mx-auto md:min-w-content md:max-w-content">
        <header>
          <div className="flex h-header items-center">
            <div className="text-xl font-bold">Green Wall</div>
          </div>
        </header>

        <main className="pb-16 pt-10">
          <h1 className="mx-auto text-center font-bold md:w-2/3 md:text-5xl">
            Generate the contributions you have made on GitHub over the years.
          </h1>

          <form className="py-8" onSubmit={handleSubmit}>
            <div className="flex h-[3rem] items-center justify-center gap-x-5">
              <button
                className="inline-flex h-full items-center rounded-sm bg-gray-100 px-4 text-sm font-medium text-gray-500 focus:outline-none"
                type="button"
                onClick={handleDownload}
              >
                Download
              </button>
              <input
                ref={inputRef}
                required
                className="inline-block h-full rounded-sm bg-gray-100 px-5 text-main-800 caret-main-500 placeholder:text-main-400 focus:outline-none focus:ring-2 focus:ring-accent-200"
                name="username"
                placeholder="GitHub Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button
                className="inline-flex h-full items-center rounded-sm bg-accent-500 px-4 text-sm font-medium text-white focus:outline-none disabled:cursor-not-allowed"
                disabled={loading}
                type="submit"
              >
                Generate
              </button>
            </div>
          </form>

          <div className="flex justify-center py-5">
            <ThemeSelector
              onChange={(theme) => {
                container.current?.style.setProperty('--graph-text-color', theme.textColor)
                container.current?.style.setProperty('--graph-bg', theme.background)

                theme.levelColors.forEach((color, i) => {
                  container.current?.style.setProperty(`--level-${i}`, color)
                })
              }}
            />
          </div>

          <Loading active={loading}>
            {graphData && (
              <div className="flex justify-center overflow-x-auto">
                <div
                  ref={container}
                  className="graph-container inline-flex flex-col justify-center p-5"
                >
                  <GraphHeader username={graphData.username} />

                  <div className="flex flex-col gap-y-5">
                    {graphData.data?.map((data, i) => (
                      <Graph key={`${i}`} data={data} />
                    ))}
                  </div>

                  <GraphFooter />
                </div>
              </div>
            )}
          </Loading>
        </main>

        {/* <footer className="sticky top-[100vh] py-3 text-center text-sm text-main-400"></footer> */}
      </div>
    </>
  )
}
