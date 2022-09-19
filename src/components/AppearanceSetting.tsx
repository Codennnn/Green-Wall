import splitbee from '@splitbee/web'

import type { GraphSize } from '../types'
import type useSetting from '../useSetting'
import ThemeSelector from './ThemeSelector'
import { RadixSwitch } from './ui-kit/RadixSwitch'
import { RadixToggleGroup } from './ui-kit/RadixToggleGroup'

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
    <div className="min-w-[min(40vw,100px)] max-w-[min(90vw,250px)] text-main-400">
      <fieldset className="fieldset">
        <label>Graph Size</label>
        <RadixToggleGroup
          options={[
            { label: 'S', value: 'small', tooltip: 'Small' },
            { label: 'M', value: 'medium', tooltip: 'Medium' },
            { label: 'L', value: 'large', tooltip: 'Large' },
          ]}
          size="small"
          type="single"
          value={settings.size}
          onValueChange={(size) => dispatch({ type: 'size', payload: size as GraphSize })}
        />
      </fieldset>

      <fieldset className="fieldset">
        <label htmlFor="origin">Show Origin</label>
        <RadixSwitch
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
