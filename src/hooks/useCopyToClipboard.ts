import { useEffect, useMemo, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

export interface UseCopyToClipboardOptions {
  /**
   * 复制成功后自动重置状态的延迟时间（毫秒）
   * @default 2000
   */
  resetDelay?: number
}

export interface UseCopyToClipboardReturn {
  /** 是否已复制成功 */
  copied: boolean
  /**
   * 复制文本到剪贴板
   * @param text 要复制的文本
   * @returns Promise<boolean> 复制是否成功
   */
  copy: (text: string) => Promise<boolean>
  /** 手动重置复制状态 */
  reset: () => void
}

const DEFAULT_RESET_DELAY = 2000
const DEFAULT_OPTIONS: UseCopyToClipboardOptions = {}

/**
 * 用于复制文本到剪贴板的自定义 Hook
 *
 * @param options 配置选项
 * @returns 包含 copied 状态和 copy 函数的对象
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = DEFAULT_OPTIONS,
): UseCopyToClipboardReturn {
  const { resetDelay = DEFAULT_RESET_DELAY } = options

  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMountedRef = useRef(false)

  const reset = useEvent(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    setCopied(false)
  })

  const copy = useEvent(async (text: string): Promise<boolean> => {
    if (!text) {
      return false
    }

    try {
      await navigator.clipboard.writeText(text)

      if (!isMountedRef.current) {
        return false
      }

      setCopied(true)

      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          return
        }

        setCopied(false)
        timerRef.current = null
      }, resetDelay)

      return true
    }
    catch (error) {
      // 复制失败，保持 copied 为 false
      if (isMountedRef.current) {
        reset()
      }

      console.error('Failed to copy text to clipboard:', error)

      return false
    }
  })

  useEffect(() => {
    isMountedRef.current = true

    return () => {
      isMountedRef.current = false

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [])

  return useMemo(
    () => ({
      copied,
      copy,
      reset,
    }),
    [copied, copy, reset],
  )
}
