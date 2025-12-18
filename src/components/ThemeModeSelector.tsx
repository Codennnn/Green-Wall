'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '~/components/ui/menu'
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

  const handleThemeChange = (value: string) => {
    setTheme(value)
  }

  return (
    <Menu>
      <MenuTrigger
        render={(
          <Button
            size="icon"
            variant="outline"
          >
            <CurrentIcon />
          </Button>
        )}
      />

      <MenuPopup>
        <MenuRadioGroup value={currentTheme} onValueChange={handleThemeChange}>
          {modes.map((mode) => {
            const Icon = mode.icon

            return (
              <MenuRadioItem
                key={mode.value}
                closeOnClick
                value={mode.value}
              >
                <div className="flex items-center gap-2">
                  <Icon className="size-4" />
                  <span>{mode.label}</span>
                </div>
              </MenuRadioItem>
            )
          })}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
