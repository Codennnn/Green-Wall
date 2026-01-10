'use client'

import { useEffect } from 'react'

import { THEME_PRESETS } from '~/constants'
import type { ThemePreset, Themes } from '~/types'

/**
 * 主题属性缓存，用于优化性能，避免重复计算相同主题的 CSS 变量
 */
const themePropertiesCache = new Map<string, React.CSSProperties>()

/**
 * 根据主题预设生成 CSS 变量对象
 *
 * @param theme - 主题预设对象
 * @returns CSS 变量对象，可直接应用于 style 属性
 */
export function getThemeProperties(theme: ThemePreset): React.CSSProperties {
  const cached = themePropertiesCache.get(theme.name)

  if (cached) {
    return cached
  }

  const properties = {
    '--theme-foreground': theme.colorForeground,
    '--theme-background': theme.colorBackground,
    '--theme-background-container': theme.colorBackgroundContainer,
    '--theme-secondary': theme.colorSecondary,
    '--theme-primary': theme.colorPrimary,
    '--theme-border': theme.colorBorder,
    '--level-0': theme.levelColors[0],
    '--level-1': theme.levelColors[1],
    '--level-2': theme.levelColors[2],
    '--level-3': theme.levelColors[3],
    '--level-4': theme.levelColors[4],
  } as React.CSSProperties

  themePropertiesCache.set(theme.name, properties)

  return properties
}

export function getThemePresetByName(themeName: Themes): ThemePreset | undefined {
  return THEME_PRESETS.find((preset) => preset.name === themeName)
}

interface ThemeVariablesProviderProps {
  theme: Themes
  children?: React.ReactNode
}

export function ThemeVariablesProvider({ theme, children }: ThemeVariablesProviderProps) {
  useEffect(() => {
    const themePreset = getThemePresetByName(theme)

    if (!themePreset) {
      console.warn(`Theme "${theme}" not found in THEME_PRESETS`)

      return
    }

    const properties = getThemeProperties(themePreset)
    const rootElement = document.documentElement

    Object.entries(properties).forEach(([key, value]) => {
      if (typeof value === 'string') {
        rootElement.style.setProperty(key, value)
      }
    })

    return () => {
      Object.keys(properties).forEach((key) => {
        rootElement.style.removeProperty(key)
      })
    }
  }, [theme])

  return <>{children}</>
}
