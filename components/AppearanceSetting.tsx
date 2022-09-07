import splitbee from '@splitbee/web'

import type { GraphSize } from '../types'
import type useSetting from '../useSetting'
import Select from './kit/Select'
import Switch from './kit/Switch'
import ThemeSelector from './ThemeSelector'

type State = ReturnType<typeof useSetting>[0]
type Dispatch = ReturnType<typeof useSetting>[1]

export default function AppearanceSetting({
  value: settings,
  onChange: dispatch,
}: {
  value: State
  onChange: Dispatch
}) {
  return (
    <div className="text-main-400 md:min-w-[min(30vw,250px)]">
      <fieldset className="flex items-center justify-between">
        <label className="mr-5">Size</label>
        <Select
          items={[
            { label: 'normal', value: 'normal' },
            { label: 'medium', value: 'medium' },
            { label: 'large', value: 'large' },
          ]}
          value={settings.size}
          onValueChange={(size) => dispatch({ type: 'size', payload: size as GraphSize })}
        />
      </fieldset>

      <fieldset className="flex items-center justify-between py-2">
        <label className="mr-5" htmlFor="origin">
          Origin
        </label>
        <Switch
          defaultChecked={true}
          id="origin"
          onCheckedChange={(checked) => dispatch({ type: 'showOrigin', payload: checked })}
        />
      </fieldset>

      <fieldset className="mt-3">
        <label className="mb-3 inline-block font-bold">Theme</label>
        <ThemeSelector
          value={settings.theme}
          onChange={(theme) => {
            splitbee.track('Change theme', { themeName: theme })
            dispatch({ type: 'theme', payload: theme })
          }}
        />
      </fieldset>
    </div>
  )
}
