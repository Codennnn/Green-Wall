import splitbee from '@splitbee/web'

import { DisplayName, GraphSize } from '../../types'
import type useSetting from '../../useSetting'
import ThemeSelector from '../ThemeSelector'
import { RadixSelect } from '../ui-kit/RadixSelect'
import { RadixSwitch } from '../ui-kit/RadixSwitch'
import { RadixToggleGroup } from '../ui-kit/RadixToggleGroup'

type State = ReturnType<typeof useSetting>[0]
type Dispatch = ReturnType<typeof useSetting>[1]

export interface AppearanceSettingProps {
  value?: State
  onChange?: Dispatch
}

export default function AppearanceSetting({
  value: settings,
  onChange: dispatch,
}: AppearanceSettingProps) {
  return (
    <div className="min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-main-400">
      <fieldset className="fieldset">
        <label>Graph Size</label>
        <RadixToggleGroup
          options={[
            { label: 'S', value: GraphSize.Small, tooltip: 'Small' },
            { label: 'M', value: GraphSize.Medium, tooltip: 'Medium' },
            { label: 'L', value: GraphSize.Large, tooltip: 'Large' },
          ]}
          size="small"
          type="single"
          value={settings?.size}
          onValueChange={(size) => dispatch?.({ type: 'size', payload: size as GraphSize })}
        />
      </fieldset>

      <fieldset className="fieldset">
        <label htmlFor="attribution">Display Name</label>
        <RadixSelect
          defaultValue="0"
          items={[
            { label: 'Username', value: DisplayName.Username },
            { label: 'Profile name', value: DisplayName.ProfileName },
          ]}
          value={settings?.displayName}
          onValueChange={(v) => dispatch?.({ type: 'displayName', payload: v as DisplayName })}
        />
      </fieldset>

      <fieldset className="fieldset">
        <label htmlFor="attribution">Attribution</label>
        <RadixSwitch
          checked={settings?.showAttribution}
          defaultChecked={true}
          id="attribution"
          onCheckedChange={(checked) => dispatch?.({ type: 'showAttribution', payload: checked })}
        />
      </fieldset>

      <fieldset className="fieldset flex-col items-start">
        <label>Themes</label>
        <ThemeSelector
          className="mt-3 pl-1"
          value={settings?.theme}
          onChange={(theme) => {
            splitbee.track('Change theme', { themeName: theme })
            dispatch?.({ type: 'theme', payload: theme })
          }}
        />
      </fieldset>
    </div>
  )
}
