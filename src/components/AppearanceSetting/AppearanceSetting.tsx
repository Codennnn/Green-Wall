import { useId } from 'react'

import { iconQuestion } from '~/components/icons'
import { ThemeSelector } from '~/components/ThemeSelector'
import { RadixSelect } from '~/components/ui-kit/RadixSelect'
import { RadixSwitch } from '~/components/ui-kit/RadixSwitch'
import { RadixToggleGroup } from '~/components/ui-kit/RadixToggleGroup'
import { RadixTooltip } from '~/components/ui-kit/RadixTooltip'
import { useData } from '~/DataContext'
import { DisplayName, GraphSize } from '~/enums'
import { trackEvent } from '~/helpers'

import { YearRangeSelect } from './YearRangeSelect'

export function AppearanceSetting() {
  const { graphData, settings, dispatchSettings } = useData()

  const attribution = useId()

  const hasProfileName = Boolean(graphData?.name)

  return (
    <div className="appearance-setting min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-main-400">
      <fieldset>
        <label>Display Name</label>
        <RadixSelect
          items={[
            { label: 'Username', value: DisplayName.Username },
            { label: 'Profile name', value: DisplayName.ProfileName, disabled: !hasProfileName },
          ]}
          value={settings.displayName}
          onValueChange={(v) => {
            dispatchSettings({ type: 'displayName', payload: v as DisplayName })
          }}
        />
      </fieldset>

      <fieldset>
        <label>Year Range</label>
        <YearRangeSelect graphData={graphData} />
      </fieldset>

      <fieldset>
        <label htmlFor={attribution}>Attribution</label>
        <RadixSwitch
          checked={settings.showAttribution}
          defaultChecked={true}
          id={attribution}
          onCheckedChange={(checked) => {
            dispatchSettings({ type: 'showAttribution', payload: checked })
          }}
        />
      </fieldset>

      <fieldset>
        <label className="flex items-center">
          Graph Size
          <RadixTooltip
            label={
              <span className="inline-block max-w-xs leading-5">
                You can also adjust the web zoom to change the size of the saved image.
              </span>
            }
          >
            <span className="ml-1 inline-block size-4 cursor-help opacity-70">{iconQuestion}</span>
          </RadixTooltip>
        </label>
        <RadixToggleGroup
          options={[
            { label: 'S', value: GraphSize.Small, tooltip: 'Small' },
            { label: 'M', value: GraphSize.Medium, tooltip: 'Medium' },
            { label: 'L', value: GraphSize.Large, tooltip: 'Large' },
          ]}
          size="small"
          type="single"
          value={settings.size}
          onValueChange={(size) => {
            dispatchSettings({ type: 'size', payload: size as GraphSize })
          }}
        />
      </fieldset>

      <fieldset className="flex-col !items-start">
        <label>Themes</label>
        <ThemeSelector
          className="mt-3 pl-1"
          value={settings.theme}
          onChange={(theme) => {
            trackEvent('Change theme', { themeName: theme })
            dispatchSettings({ type: 'theme', payload: theme })
          }}
        />
      </fieldset>
    </div>
  )
}
