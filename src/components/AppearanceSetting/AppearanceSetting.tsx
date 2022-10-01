import splitbee from '@splitbee/web'

import { type GraphData, DisplayName, GraphSize } from '../../types'
import type useSetting from '../../useSetting'
import ThemeSelector from '../ThemeSelector'
import { RadixSelect } from '../ui-kit/RadixSelect'
import { RadixSwitch } from '../ui-kit/RadixSwitch'
import { RadixToggleGroup } from '../ui-kit/RadixToggleGroup'

type State = ReturnType<typeof useSetting>[0]
type Dispatch = ReturnType<typeof useSetting>[1]

interface AppearanceSettingProps {
  value?: State
  onChange?: Dispatch
  graphData: GraphData | undefined
}

export default function AppearanceSetting({
  value: settings,
  onChange: dispatch,
  graphData,
}: AppearanceSettingProps) {
  return (
    <div className="appearance-setting min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-main-400">
      <fieldset>
        <label>Display Name</label>
        <RadixSelect
          items={[
            { label: 'Username', value: DisplayName.Username },
            { label: 'Profile name', value: DisplayName.ProfileName },
          ]}
          value={settings?.displayName}
          onValueChange={(v) => dispatch?.({ type: 'displayName', payload: v as DisplayName })}
        />
      </fieldset>

      <fieldset>
        <label>Since Year</label>
        <RadixSelect
          defaultValue={graphData?.contributionYears.at(-1)?.toString()}
          items={graphData?.contributionYears.map((year) => ({
            label: `${year}`,
            value: `${year}`,
          }))}
          value={settings?.sinceYear}
          onValueChange={(v) => dispatch?.({ type: 'sinceYear', payload: v })}
        />
      </fieldset>

      <fieldset>
        <label htmlFor="attribution">Attribution</label>
        <RadixSwitch
          checked={settings?.showAttribution}
          defaultChecked={true}
          id="attribution"
          onCheckedChange={(checked) => dispatch?.({ type: 'showAttribution', payload: checked })}
        />
      </fieldset>

      <fieldset>
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

      <fieldset className="flex-col !items-start">
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
