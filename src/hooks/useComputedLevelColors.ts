'use client'

import { useEffect, useRef, useState } from 'react'

import { DEFAULT_LEVEL_COLORS } from '~/constants'
import { rgbToHex } from '~/lib/utils'
import type { ThemePreset } from '~/types'

/**
 * 计算并返回解析后的等级颜色值
 *
 * 该 hook 负责：
 * 1. 解析 CSS 变量（包括 color-mix() 函数）为实际的十六进制颜色值
 * 2. 在主题变化时重新计算颜色
 * 3. 用于图片导出时获取准确的颜色值
 *
 * @param containerRef - 用于获取计算样式的容器元素 ref
 * @param applyingTheme - 当前应用的主题（用于触发重新计算）
 * @returns 解析后的等级颜色数组 [level-0, level-1, level-2, level-3, level-4]
 */
export function useComputedLevelColors(
  containerRef: React.RefObject<HTMLElement | null>,
  applyingTheme: ThemePreset | undefined,
): string[] {
  const [computedColors, setComputedColors] = useState<string[]>(DEFAULT_LEVEL_COLORS)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    // 使用 requestAnimationFrame 确保样式已应用
    const rafId = requestAnimationFrame(() => {
      // 组件可能在 RAF 执行前卸载
      if (!isMounted.current) {
        return
      }

      const computedStyle = getComputedStyle(container)
      const colors: string[] = []

      for (let i = 0; i <= 4; i++) {
        const cssVar = computedStyle.getPropertyValue(`--level-${i}`).trim()

        if (cssVar) {
          // 创建临时元素来解析可能包含 color-mix() 的颜色值
          const tempDiv = document.createElement('div')
          tempDiv.style.cssText = `color: ${cssVar}; display: none;`
          document.body.appendChild(tempDiv)

          const resolved = getComputedStyle(tempDiv).color
          document.body.removeChild(tempDiv)

          colors.push(rgbToHex(resolved))
        }
        else {
          colors.push(DEFAULT_LEVEL_COLORS[i])
        }
      }

      setComputedColors(colors)
    })

    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [containerRef, applyingTheme])

  return computedColors
}

/**
 * 同步计算等级颜色（用于服务端渲染或不需要 DOM 解析的场景）
 *
 * @param themeColors - 主题中定义的颜色数组
 * @returns 等级颜色数组（可能包含 CSS 变量，需要进一步解析）
 */
export function getStaticLevelColors(
  themeColors: ThemePreset['levelColors'] | undefined,
): string[] {
  return themeColors ?? DEFAULT_LEVEL_COLORS
}
