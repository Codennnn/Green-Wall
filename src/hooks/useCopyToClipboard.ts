import { useCallback, useEffect, useRef, useState } from 'react'
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

/**
 * 用于复制文本到剪贴板的自定义 Hook
 *
 * @param options 配置选项
 * @returns 包含 copied 状态和 copy 函数的对象
 */
export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboardReturn {
  const { resetDelay = 2000 } = options

  const [copied, setCopied] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const reset = useEvent(() => {
    setCopied(false)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  })

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) {
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)

        if (timerRef.current) {
          clearTimeout(timerRef.current)
        }

        timerRef.current = setTimeout(() => {
          setCopied(false)
          timerRef.current = null
        }, resetDelay)

        return true
      }
      catch (error) {
        // 复制失败，保持 copied 为 false
        console.error('Failed to copy text to clipboard:', error)

        return false
      }
    },
    [resetDelay],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  return {
    copied,
    copy,
    reset,
  }
}
