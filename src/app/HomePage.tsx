'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { toBlob, toPng } from 'html-to-image'

import { AppearanceSetting, DraggableAppearanceSetting } from '~/components/AppearanceSetting'
import { ContributionsGraph } from '~/components/ContributionsGraph'
import { ErrorMessage } from '~/components/ErrorMessage'
import GenerateButton from '~/components/GenerateButton'
import { iconClipboard, iconClipboardList, iconImage } from '~/components/icons'
import Loading from '~/components/Loading'
import { SettingButton } from '~/components/SettingButton'
import { ShareButton } from '~/components/ShareButton'
import { useData } from '~/DataContext'
import { trackEvent } from '~/helpers'
import { useGraphRequest } from '~/useGraphRequest'

export function HomePage() {
  const canUseClipboardItem = typeof ClipboardItem !== 'undefined'

  const graphRef = useRef<HTMLDivElement>(null)
  const actionRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const { graphData, setGraphData, dispatchSettings } = useData()

  const [username, setUsername] = useState('')
  const [settingPopUp, setSettingPopUp] = useState(false)

  const [downloading, setDownloading] = useState(false)

  const [doingCopy, setDoingCopy] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const reset = () => {
    setGraphData(undefined)
    setSettingPopUp(false)
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
      } catch (e) {
        if (e instanceof Error) {
          trackEvent('Error: Download Image', { msg: e.message })
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
      } catch (e) {
        if (e instanceof Error) {
          trackEvent('Error: Copy Image', { msg: e.message })
        }
      } finally {
        setDoingCopy(false)
      }
    }
  }

  const actionRefCallback = useCallback((node: HTMLDivElement | null) => {
    actionRef.current = node

    if (actionRef.current) {
      const offsetTop = actionRef.current.getBoundingClientRect().top
      if (offsetTop > 0) {
        window.scrollTo(0, offsetTop)
      }
    }
  }, [])

  return (
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-6xl md:leading-[1.2]">
        Review the contributions you have made on GitHub over the years.
      </h1>

      <div className="py-12 md:py-16">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void handleSubmit()
          }}
        >
          <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
            <input
              ref={inputRef}
              required
              className="
                inline-block h-[2.8rem] overflow-hidden rounded-lg bg-main-100 px-5
                text-center text-lg font-medium text-main-600 caret-main-500 shadow-main-300/90 outline-none
                transition-all duration-300
                placeholder:select-none placeholder:font-normal placeholder:text-main-400
                focus:bg-white focus:shadow-[0_0_1.5rem_var(--tw-shadow-color)]
              "
              disabled={loading}
              name="username"
              placeholder="GitHub Username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
              }}
              onFocus={() => inputRef.current?.select()}
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
                    className={`
                    inline-flex h-full items-center rounded-md bg-main-100 px-4 py-2 text-sm font-medium text-main-500 hover:bg-main-200 disabled:pointer-events-none motion-safe:transition-colors motion-safe:duration-300 md:text-base`}
                    disabled={downloading}
                    onClick={() => {
                      void handleDownload()
                    }}
                  >
                    <span className="mr-2 h-5 w-5 shrink-0 md:h-6 md:w-6">{iconImage}</span>
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
                      <span className="mr-2 h-5 w-5 shrink-0 md:h-6 md:w-6">
                        {copySuccess ? iconClipboardList : iconClipboard}
                      </span>
                      <span>{copySuccess ? 'Copied' : 'Copy'} as Image</span>
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 md:justify-center">
                  <ShareButton />
                  <div className="relative">
                    <SettingButton
                      content={<AppearanceSetting />}
                      onClick={() => {
                        if (settingPopUp) {
                          setSettingPopUp(false)
                        }
                      }}
                      onPopOut={() => {
                        setSettingPopUp(true)
                      }}
                    />
                    {settingPopUp && (
                      <DraggableAppearanceSetting
                        onClose={() => {
                          setSettingPopUp(false)
                        }}
                      >
                        <AppearanceSetting />
                      </DraggableAppearanceSetting>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex overflow-x-auto md:justify-center">
                <ContributionsGraph ref={graphRef} />
              </div>
            </>
          )}
        </Loading>
      )}
    </div>
  )
}
