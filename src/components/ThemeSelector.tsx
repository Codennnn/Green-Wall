import { memo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { THEME_PRESETS, THEMES } from '~/constants'
import { cn } from '~/lib/utils'
import type { ThemePreset, Themes } from '~/types'

interface ThemeSelectorProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Themes
  onChange?: (theme: Themes) => void
}

const themePropertiesCache = new Map<string, React.CSSProperties>()

function getThemeProperties(theme: ThemePreset): React.CSSProperties {
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

interface ThemeOptionProps {
  theme: ThemePreset
  isSelected: boolean
  onClick: (themeName: Themes) => void
}

const ThemeOption = memo(function ThemeOption({ theme, isSelected, onClick }: ThemeOptionProps) {
  const themeProperties = getThemeProperties(theme)

  const handleClick = useEvent(() => {
    onClick(theme.name)
  })

  return (
    <div
      className={cn(
        'h-20 w-full cursor-pointer overflow-hidden rounded-lg transition-all duration-300',
        'ring-2 ring-offset-0',
        isSelected
          ? 'ring-brand-400/70 ring-offset-2 ring-offset-background hover:ring-brand-500/80'
          : 'ring-transparent hover:ring-main-300/50 hover:ring-offset-1 hover:ring-offset-background hover:shadow-lg',
      )}
      style={themeProperties}
      title={theme.name}
      onClick={handleClick}
    >
      <div
        className="flex size-full justify-center p-5 pb-0"
        style={{ background: 'var(--theme-background-container)' }}
      >
        <div className="flex size-full items-center justify-center gap-2 overflow-hidden rounded-t-md border-dashed border-(--theme-border) bg-(--theme-background) p-5">
          <span className="size-3 rounded bg-(--level-0)" />
          <span className="size-3 rounded bg-(--level-1)" />
          <span className="size-3 rounded bg-(--level-2)" />
          <span className="size-3 rounded bg-(--level-3)" />
        </div>
      </div>
    </div>
  )
})

export const ThemeSelector = memo(function ThemeSelector(props: ThemeSelectorProps) {
  const { value, onChange, className = '', ...rest } = props

  const handleThemeClick = useEvent(
    (themeName: Themes) => {
      onChange?.(themeName)
    },
  )

  return (
    <div {...rest} className={cn('flex w-full flex-col gap-3', className)}>
      {THEME_PRESETS.map((theme) => (
        <ThemeOption
          key={theme.name}
          isSelected={value === theme.name}
          theme={theme}
          onClick={handleThemeClick}
        />
      ))}
    </div>
  )
})

interface ThemeLevelOptionProps {
  theme: { name: Themes, levelColors: string[] }
  isSelected: boolean
  onClick: (themeName: Themes) => void
}

const ThemeLevelOption = memo(function ThemeLevelOption({
  theme,
  isSelected,
  onClick,
}: ThemeLevelOptionProps) {
  const handleClick = useEvent(() => {
    onClick(theme.name)
  })

  return (
    <div
      className={cn(
        'relative grid size-5 cursor-pointer grid-cols-2 grid-rows-2 overflow-hidden rounded-xs transition-all duration-300',
        'ring-2 ring-offset-0',
        isSelected
          ? 'ring-brand-400/70 ring-offset-2 ring-offset-background hover:ring-brand-500/80 scale-100'
          : 'ring-transparent hover:ring-main-300/50 hover:ring-offset-1 hover:ring-offset-background hover:scale-110',
      )}
      title={theme.name}
      onClick={handleClick}
    >
      <span style={{ backgroundColor: theme.levelColors[1] }} />
      <span style={{ backgroundColor: theme.levelColors[2] }} />
      <span style={{ backgroundColor: theme.levelColors[3] }} />
      <span style={{ backgroundColor: theme.levelColors[4] }} />
    </div>
  )
})

export const ThemeLevelSelector = memo(function ThemeLevelSelector(props: ThemeSelectorProps) {
  const { value, onChange, className = '', ...rest } = props

  const handleThemeClick = useEvent(
    (themeName: Themes) => {
      onChange?.(themeName)
    },
  )

  return (
    <div {...rest} className={cn('flex flex-wrap gap-3', className)}>
      {THEMES.map((theme) => (
        <ThemeLevelOption
          key={theme.name}
          isSelected={value === theme.name}
          theme={theme}
          onClick={handleThemeClick}
        />
      ))}
    </div>
  )
})
