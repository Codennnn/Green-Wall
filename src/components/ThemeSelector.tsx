import { useEvent } from 'react-use-event-hook'

import { THEME_PRESETS } from '~/constants'
import { cn } from '~/lib/utils'
import type { ThemePreset, Themes } from '~/types'

import { getThemeProperties } from './ThemeVariablesProvider'

interface ThemeSelectorProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Themes
  onChange?: (theme: Themes) => void
}

interface ThemeOptionProps {
  theme: ThemePreset
  isSelected: boolean
  onClick: (themeName: Themes) => void
}

function ThemeOption({ theme, isSelected, onClick }: ThemeOptionProps) {
  const themeProperties = getThemeProperties(theme)

  const handleClick = useEvent(() => {
    onClick(theme.name)
  })

  return (
    <div
      className={cn(
        'h-15 w-full cursor-pointer overflow-hidden rounded-md transition-all duration-300',
        'ring-2 ring-offset-0',
        isSelected
          ? 'ring-brand-400/70 ring-offset-2 ring-offset-background hover:ring-brand-500/80'
          : 'ring-transparent hover:ring-muted-foreground/40 hover:ring-offset-1 hover:ring-offset-background hover:shadow-lg',
      )}
      style={themeProperties}
      title={theme.name}
      onClick={handleClick}
    >
      <div
        className="flex size-full justify-center p-2.5 pb-0"
        style={{ background: 'var(--theme-background-container)' }}
      >
        <div className="flex size-full items-center justify-center gap-2 overflow-hidden rounded-t-md border-dashed border-(--theme-border) bg-(--theme-background) p-4">
          <span className="size-3 rounded bg-(--level-0)" />
          <span className="size-3 rounded bg-(--level-1)" />
          <span className="size-3 rounded bg-(--level-2)" />
          <span className="size-3 rounded bg-(--level-3)" />
        </div>
      </div>
    </div>
  )
}

export function ThemeSelector(props: ThemeSelectorProps) {
  const { value, onChange, className, ...rest } = props

  const handleThemeClick = useEvent(
    (themeName: Themes) => {
      onChange?.(themeName)
    },
  )

  const selectableThemes = THEME_PRESETS.filter((theme) => theme.selectable !== false)

  return (
    <div
      {...rest}
      className={cn(
        'grid grid-cols-2 gap-3 w-full',
        className,
      )}
    >
      {selectableThemes.map((theme) => (
        <ThemeOption
          key={theme.name}
          isSelected={value === theme.name}
          theme={theme}
          onClick={handleThemeClick}
        />
      ))}
    </div>
  )
}
