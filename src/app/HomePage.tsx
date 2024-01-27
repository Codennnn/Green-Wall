'use client'

import { useCallback, useId, useRef, useState } from 'react'

import { toBlob, toPng } from 'html-to-image'

import { AppearanceSetting, DraggableAppearanceSetting } from '~/components/AppearanceSetting'
import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import GenerateButton from '~/components/GenerateButton'
import { iconClipboard, iconClipboardList, iconImage } from '~/components/icons'
import Loading from '~/components/Loading'
import { SearchInput } from '~/components/SearchInput'
import { SettingButton } from '~/components/SettingButton'
import { ShareButton } from '~/components/ShareButton'
import { useData } from '~/DataContext'
import { trackEvent } from '~/helpers'
import { useGraphRequest } from '~/useGraphRequest'

export function HomePage() {
  const canUseClipboardItem = typeof ClipboardItem !== 'undefined'

  const graphRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement | null>(null)

  const { graphData, setGraphData, dispatchSettings } = useData()

  const [username, setUsername] = useState('')
  const [settingPopUp, setSettingPopUp] = useState<{ offsetX: number; offsetY: number }>()

  const [downloading, setDownloading] = useState(false)

  const [doingCopy, setDoingCopy] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const reset = () => {
    setGraphData(undefined)
    setSettingPopUp(undefined)
    dispatchSettings({ type: 'reset' })
  }

  const handleError = () => {
    reset()
  }

  const { run, loading, error } = useGraphRequest({ onError: handleError })

  const handleSubmit = async () => {
    if (username.trim() && !loading) {
      reset()
      trackEvent('Click Generate')
      const data = await run({ username })
      setGraphData(data)
    }
  }

  const handleDownload = async () => {
    if (graphRef.current && graphData && !downloading) {
      try {
        setDownloading(true)
        trackEvent('Click Download')

        const dataURL = await toPng(graphRef.current)
        const trigger = document.createElement('a')
        trigger.href = dataURL
        trigger.download = `${graphData.login}_contributions`
        trigger.click()
      } catch (err) {
        if (err instanceof Error) {
          trackEvent('Error: Download Image', { msg: err.message })
        }
      } finally {
        setTimeout(() => {
          setDownloading(false)
        }, 2000)
      }
    }
  }

  const handleCopyImage = async () => {
    if (graphRef.current && graphData && canUseClipboardItem && !doingCopy) {
      try {
        setDoingCopy(true)
        trackEvent('Click Copy Image')

        const item = new ClipboardItem({
          'image/png': (async () => {
            /**
             * To be able to use `ClipboardItem` in safari, need to pass promise directly into it.
             * @see https://stackoverflow.com/questions/66312944/javascript-clipboard-api-write-does-not-work-in-safari
             */
            if (!graphRef.current) {
              throw new Error()
            }

            const blobData = await toBlob(graphRef.current)

            if (!blobData) {
              throw new Error()
            }

            return blobData
          })(),
        })

        await navigator.clipboard.write([item])

        setCopySuccess(true)
        setTimeout(() => {
          setCopySuccess(false)
        }, 2000)
      } catch (err) {
        if (err instanceof Error) {
          trackEvent('Error: Copy Image', { msg: err.message })
        }
      } finally {
        setDoingCopy(false)
      }
    }
  }

  const popoverContentId = useId()
  const graphWrapperId = useId()

  const actionRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      actionRef.current = node

      if (actionRef.current) {
        const offsetTop = actionRef.current.getBoundingClientRect().top

        if (offsetTop > 0) {
          // When the graph appears, automatically scrolls to the position where the graph appears to avoid obscuring it.
          document.body.scrollTo({ left: 0, top: offsetTop, behavior: 'smooth' })
        }

        setTimeout(() => {
          // Automatically pop-up settings for users to discover the settings at first glance.
          const graphWrapperEle = document.getElementById(graphWrapperId)

          if (graphWrapperEle instanceof HTMLElement) {
            const { top, right } = graphWrapperEle.getBoundingClientRect()

            setSettingPopUp({
              offsetX: right,
              offsetY: top,
            })
          }
        }, 500)
      }
    },
    [graphWrapperId]
  )

  return (
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-6xl md:leading-[1.2]">
        Review the contributions you have made on GitHub over the years.
      </h1>

      <div className="py-12 md:py-16">
        <form
          onSubmit={(ev) => {
            ev.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
            <SearchInput
              disabled={loading}
              value={username}
              onChange={(ev) => {
                setUsername(ev.target.value)
              }}
            />
            <GenerateButton loading={loading} type="submit" />
          </div>
        </form>
      </div>

      {error ? (
        <ErrorMessage errorType={error.errorType} text={error.message} />
      ) : (
        <Loading active={loading}>
          {graphData && (
            <>
              <div
                ref={actionRefCallback}
                className="flex flex-row-reverse flex-wrap items-center justify-center gap-x-6 gap-y-4 py-5"
              >
                <div className="flex gap-x-3">
                  <button
                    className="inline-flex h-full items-center rounded-md bg-main-100 px-4 py-2 text-sm font-medium text-main-500 hover:bg-main-200 disabled:pointer-events-none motion-safe:transition-colors motion-safe:duration-300 md:text-base"
                    disabled={downloading}
                    onClick={() => {
                      void handleDownload()
                    }}
                  >
                    <span className="mr-2 size-5 shrink-0 md:size-6">{iconImage}</span>
                    <span>Save as Image</span>
                  </button>

                  {canUseClipboardItem && (
                    <button
                      className={`
                      inline-flex h-full items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none md:text-base
                      ${
                        copySuccess
                          ? 'bg-accent-100 text-accent-500'
                          : 'bg-main-100 text-main-500 duration-300 hover:bg-main-200 motion-safe:transition-colors'
                      }
                      `}
                      disabled={doingCopy}
                      onClick={() => {
                        void handleCopyImage()
                      }}
                    >
                      <span className="mr-2 size-5 shrink-0 md:size-6">
                        {copySuccess ? iconClipboardList : iconClipboard}
                      </span>
                      <span>{copySuccess ? 'Copied' : 'Copy'} as Image</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 md:justify-center">
                  <ShareButton />

                  <SettingButton
                    content={<AppearanceSetting />}
                    popoverContentId={popoverContentId}
                    onClick={() => {
                      if (settingPopUp) {
                        setSettingPopUp(undefined)
                      }
                    }}
                    onPopOut={() => {
                      const popoverContentWrapper =
                        document.getElementById(popoverContentId)?.parentNode

                      if (popoverContentWrapper instanceof HTMLElement) {
                        const style = window.getComputedStyle(popoverContentWrapper, null)
                        const matrix = style.transform
                        const values = matrix.split('(')[1].split(')')[0].split(',')
                        const offsetX = values[4]
                        const offsetY = values[5]

                        setSettingPopUp({
                          offsetX: Number(offsetX),
                          offsetY: Number(offsetY),
                        })
                      }
                    }}
                  />

                  <div className="relative">
                    {!!settingPopUp && (
                      <DraggableAppearanceSetting
                        initialPosition={{
                          x: settingPopUp.offsetX,
                          y: settingPopUp.offsetY,
                        }}
                        onClose={() => {
                          setSettingPopUp(undefined)
                        }}
                      >
                        <AppearanceSetting />
                      </DraggableAppearanceSetting>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-auto md:justify-center">
                <ContributionsGraph ref={graphRef} wrapperId={graphWrapperId} />
              </div>
            </>
          )}
        </Loading>
      )}
    </div>
  )
}
