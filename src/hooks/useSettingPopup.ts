'use client'

import { useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { eventTracker } from '~/lib/analytics'

export interface SettingPopupPosition {
  offsetX: number
  offsetY: number
}

export function useSettingPopup(graphWrapperId: string) {
  const actionRef = useRef<HTMLDivElement | null>(null)
  const hasAutoOpenedRef = useRef(false)

  const [settingPopupPosition, setSettingPopupPosition] = useState<SettingPopupPosition>()

  const closeSettingPopup = useEvent(() => {
    setSettingPopupPosition(undefined)
  })

  const openSettingPopupAt = useEvent((position: SettingPopupPosition) => {
    setSettingPopupPosition(position)
  })

  const graphActionsRefCallback = useEvent((node: HTMLDivElement | null) => {
    actionRef.current = node

    if (actionRef.current) {
      const offsetTop = actionRef.current.getBoundingClientRect().top

      if (offsetTop > 0) {
        // When the graph appears, automatically scrolls to the position where the graph appears to avoid obscuring it.
        document.body.scrollTo({
          left: 0,
          top: offsetTop,
          behavior: 'smooth',
        })
      }

      setTimeout(() => {
        // Automatically pop-up settings for users to discover the settings at first glance.
        const graphWrapperEle = document.getElementById(graphWrapperId)

        if (graphWrapperEle instanceof HTMLElement) {
          const { top, right } = graphWrapperEle.getBoundingClientRect()

          setSettingPopupPosition({
            offsetX: right + 20,
            offsetY: top,
          })

          if (!hasAutoOpenedRef.current) {
            hasAutoOpenedRef.current = true
            eventTracker.ui.settings.open('auto')
          }
        }
      }, 500)
    }
  })

  const handleSettingPopOut = useEvent((popoverContentId: string) => {
    const popoverContentWrapper = document.getElementById(popoverContentId)?.parentNode

    if (popoverContentWrapper instanceof HTMLElement) {
      const style = window.getComputedStyle(popoverContentWrapper, null)
      const matrix = style.transform

      if (matrix && matrix !== 'none' && matrix.includes('(')) {
        const values = matrix.split('(')[1].split(')')[0].split(',')
        const offsetX = values[4]
        const offsetY = values[5]

        setSettingPopupPosition({
          offsetX: Number(offsetX),
          offsetY: Number(offsetY),
        })
      }
      else {
        const rect = popoverContentWrapper.getBoundingClientRect()
        setSettingPopupPosition({
          offsetX: rect.left,
          offsetY: rect.top,
        })
      }
    }
  })

  return {
    actionRef: actionRef,
    settingPopupPosition,
    closeSettingPopup,
    openSettingPopupAt,
    graphActionsRefCallback,
    handleSettingPopOut,
  }
}
