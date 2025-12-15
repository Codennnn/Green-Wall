'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { ThemeMode } from '~/enums'

export function ThemeModeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const t = useTranslations('themeMode')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-9 w-full items-center justify-center">
        <div className="size-4 animate-pulse rounded-full bg-main-200" />
      </div>
    )
  }

  const DEFAULT_THEME_MODE = ThemeMode.System

  const modes = [
    {
      value: ThemeMode.Light,
      label: t('light'),
      icon: SunIcon,
    },
    {
      value: ThemeMode.Dark,
      label: t('dark'),
      icon: MoonIcon,
    },
    {
      value: DEFAULT_THEME_MODE,
      label: t('system'),
      icon: SunMoonIcon,
    },
  ]

  const currentTheme = (theme ?? DEFAULT_THEME_MODE) as ThemeMode
  const currentMode
    = modes.find((mode) => mode.value === currentTheme)
      ?? modes.find((mode) => mode.value === DEFAULT_THEME_MODE)!
  const CurrentIcon = currentMode.icon

  return (
    <Select
      value={currentTheme}
      onValueChange={(value) => {
        setTheme(value!)
      }}
    >
      <SelectTrigger className="flex size-[38px] min-w-0 items-center rounded-md border-0 bg-main-100! p-0 text-sm font-medium text-main-500! shadow-none ring-4 ring-background transition-colors duration-300 hover:bg-main-200! focus-visible:ring-0 md:ring-8 before:shadow-none **:data-[slot=select-icon]:hidden">
        <span className="size-full flex items-center justify-center">
          <CurrentIcon className="size-5.5" />
        </span>
      </SelectTrigger>

      <SelectContent>
        {modes.map((mode) => {
          const Icon = mode.icon

          return (
            <SelectItem key={mode.value} value={mode.value}>
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span>{mode.label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
