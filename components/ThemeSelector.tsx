import { themeList } from '../constants'
import type { Themes } from '../types'

interface ThemeSelectorProps {
  value?: Themes
  onChange?: (theme: Themes) => void
}

export default function ThemeSelector(props: ThemeSelectorProps) {
  return (
    <div className="flex gap-3">
      {themeList.map((theme) => {
        return (
          <div
            key={theme.name}
            className={`grid h-5 w-5 cursor-pointer grid-cols-2 grid-rows-2 ring transition-shadow duration-200 ${
              props.value === theme.name
                ? 'ring-main-400/60 hover:ring-main-400/60'
                : 'ring-transparent hover:ring-main-300'
            }`}
            title={theme.name}
            onClick={() => props.onChange?.(theme.name)}
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
