'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { eventTracker } from '~/lib/analytics'

export interface SettingPopupPosition {
  offsetX: number
  offsetY: number
}

function isSameSettingPopupPosition(
  current: SettingPopupPosition | undefined,
  next: SettingPopupPosition | undefined,
) {
  return current?.offsetX === next?.offsetX && current?.offsetY === next?.offsetY
}

export function useSettingPopup(graphWrapperId: string) {
  const actionRef = useRef<HTMLDivElement | null>(null)
  const hasAutoOpenedRef = useRef(false)
  const autoOpenTimeoutRef = useRef<number | null>(null)

  const [settingPopupPosition, setSettingPopupPosition] = useState<SettingPopupPosition>()

  const clearAutoOpenTimeout = useEvent(() => {
    if (autoOpenTimeoutRef.current === null) {
      return
    }

    window.clearTimeout(autoOpenTimeoutRef.current)
    autoOpenTimeoutRef.current = null
  })

  const updateSettingPopupPosition = useEvent((position: SettingPopupPosition | undefined) => {
    setSettingPopupPosition((current) => (
      isSameSettingPopupPosition(current, position) ? current : position
    ))
  })

  const closeSettingPopup = useEvent(() => {
    updateSettingPopupPosition(undefined)
  })

  const openSettingPopupAt = useEvent((position: SettingPopupPosition) => {
    updateSettingPopupPosition(position)
  })

  const graphActionsRefCallback = useEvent((node: HTMLDivElement | null) => {
    clearAutoOpenTimeout()
    actionRef.current = node

    if (!node) {
      return
    }

    const offsetTop = node.getBoundingClientRect().top

    if (offsetTop > 0) {
      // When the graph appears, automatically scrolls to the position where the graph appears to avoid obscuring it.
      document.body.scrollTo({
        left: 0,
        top: offsetTop,
        behavior: 'smooth',
      })
    }

    if (hasAutoOpenedRef.current) {
      return
    }

    autoOpenTimeoutRef.current = window.setTimeout(() => {
      autoOpenTimeoutRef.current = null

      const graphWrapperEle = document.getElementById(graphWrapperId)

      if (!(graphWrapperEle instanceof HTMLElement)) {
        return
      }

      const { top, right } = graphWrapperEle.getBoundingClientRect()

      updateSettingPopupPosition({
        offsetX: right + 20,
        offsetY: top,
      })

      hasAutoOpenedRef.current = true
      eventTracker.ui.settings.open('auto')
    }, 500)
  })

  const handleSettingPopOut = useEvent((popoverContentId: string) => {
    const popoverContentWrapper = document.getElementById(popoverContentId)?.parentElement

    if (!(popoverContentWrapper instanceof HTMLElement)) {
      return
    }

    const transform = window.getComputedStyle(popoverContentWrapper, null).transform

    if (transform && transform !== 'none') {
      try {
        const matrix = new DOMMatrixReadOnly(transform)

        if (Number.isFinite(matrix.m41) && Number.isFinite(matrix.m42)) {
          updateSettingPopupPosition({
            offsetX: matrix.m41,
            offsetY: matrix.m42,
          })

          return
        }
      }
      catch {
        // Fall back to layout coordinates below when the browser returns an unexpected transform.
      }
    }

    const rect = popoverContentWrapper.getBoundingClientRect()
    updateSettingPopupPosition({
      offsetX: rect.left,
      offsetY: rect.top,
    })
  })

  useEffect(() => clearAutoOpenTimeout, [clearAutoOpenTimeout])

  return {
    actionRef,
    settingPopupPosition,
    closeSettingPopup,
    openSettingPopupAt,
    graphActionsRefCallback,
    handleSettingPopOut,
  }
}
