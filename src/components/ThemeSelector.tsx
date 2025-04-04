import { THEME_PRESETS, THEMES } from '~/constants'
import type { Themes } from '~/types'

interface ThemeSelectorProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Themes
  onChange?: (theme: Themes) => void
}

export function ThemeSelector(props: ThemeSelectorProps) {
  const { value, onChange, className = '', ...rest } = props

  return (
    <div {...rest} className={`flex w-full flex-col gap-3 ${className}`}>
      {THEME_PRESETS.map((theme) => {
        const isSelected = value === theme.name

        const themeProperties = {
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

        return (
          <div
            key={theme.name}
            className={`
            h-20 w-full cursor-pointer overflow-hidden rounded-lg ring-2 transition-shadow duration-200
            ${
          isSelected
            ? 'ring-main-400/60 ring-offset-2 hover:ring-main-300'
            : 'ring-transparent hover:ring-4 hover:ring-main-200'
          }
            `}
            style={themeProperties}
            title={theme.name}
            onClick={() => onChange?.(theme.name)}
          >
            <div
              className="flex size-full justify-center p-5 pb-0"
              style={{ background: 'var(--theme-background-container)' }}
            >
              <div className="flex size-full items-center justify-center gap-2 overflow-hidden rounded-t-md border-dashed border-[var(--theme-border)] bg-[var(--theme-background)] p-5">
                <span className="size-3 rounded bg-[var(--level-0)]" />
                <span className="size-3 rounded bg-[var(--level-1)]" />
                <span className="size-3 rounded bg-[var(--level-2)]" />
                <span className="size-3 rounded bg-[var(--level-3)]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ThemeLevelSelector(props: ThemeSelectorProps) {
  const { value, onChange, className = '', ...rest } = props

  return (
    <div {...rest} className={`flex flex-wrap gap-3 ${className}`}>
      {THEMES.map((theme) => {
        const isSelected = value === theme.name

        return (
          <div
            key={theme.name}
            className={`
            grid size-5 cursor-pointer grid-cols-2 grid-rows-2 overflow-hidden rounded-sm ring-2 transition-shadow duration-200
            ${
          isSelected
            ? 'ring-main-400/60 ring-offset-2 hover:ring-main-300'
            : 'ring-transparent hover:ring-4 hover:ring-main-200'
          }
            `}
            title={theme.name}
            onClick={() => onChange?.(theme.name)}
          >
            <span style={{ backgroundColor: theme.levelColors[1] }} />
            <span style={{ backgroundColor: theme.levelColors[2] }} />
            <span style={{ backgroundColor: theme.levelColors[3] }} />
            <span style={{ backgroundColor: theme.levelColors[4] }} />
          </div>
        )
      })}
    </div>
  )
}
