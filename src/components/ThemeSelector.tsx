import { THEMES } from '~/constants'
import type { Themes } from '~/types'

interface ThemeSelectorProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Themes
  onChange?: (theme: Themes) => void
}

export function ThemeSelector(props: ThemeSelectorProps) {
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
