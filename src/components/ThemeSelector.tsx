import { THEMES } from '../constants'
import type { Themes } from '../types'

interface ThemeSelectorProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: Themes
  onChange?: (theme: Themes) => void
}

export function ThemeSelector(props: ThemeSelectorProps) {
  const { value, onChange, ...rest } = props

  return (
    <div {...rest} className={`flex flex-wrap gap-3 ${rest.className}`}>
      {THEMES.map((theme) => {
        return (
          <div
            key={theme.name}
            className={`
            grid h-5 w-5 cursor-pointer grid-cols-2 grid-rows-2 ring-[2px] transition-shadow duration-200
            ${
              value === theme.name
                ? 'ring-main-400/60 ring-offset-2 hover:ring-main-400/60'
                : 'ring-transparent hover:ring-4 hover:ring-main-300/80'
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
