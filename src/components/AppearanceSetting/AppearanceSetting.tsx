import { useId } from 'react'

import { CircleHelpIcon } from 'lucide-react'

import { ThemeSelector } from '~/components/ThemeSelector'
import { RadixSwitch } from '~/components/ui-kit/RadixSwitch'
import { RadixToggleGroup } from '~/components/ui-kit/RadixToggleGroup'
import { RadixTooltip } from '~/components/ui-kit/RadixTooltip'
import { useData } from '~/DataContext'
import { BlockShape, GraphSize } from '~/enums'
import { trackEvent } from '~/helpers'

import { YearRangeSelect } from './YearRangeSelect'

export function AppearanceSetting() {
  const { graphData, settings, dispatchSettings } = useData()

  const daysLabelId = useId()
  const attributionId = useId()

  return (
    <div className="appearance-setting min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-main-400">
      <fieldset>
        <label>Year Range</label>
        <YearRangeSelect graphData={graphData} />
      </fieldset>

      <fieldset>
        <label htmlFor={daysLabelId}>Days Label</label>
        <RadixSwitch
          checked={settings.daysLabel}
          defaultChecked={true}
          id={daysLabelId}
          onCheckedChange={(checked) => {
            dispatchSettings({ type: 'daysLabel', payload: checked })
          }}
        />
      </fieldset>

      <fieldset>
        <label htmlFor={attributionId}>Attribution</label>
        <RadixSwitch
          checked={settings.showAttribution}
          defaultChecked={true}
          id={attributionId}
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
            <CircleHelpIcon className="ml-1 inline-block size-4 cursor-help opacity-90" />
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

      <fieldset>
        <label className="flex items-center">Block Shape</label>
        <RadixToggleGroup
          options={[
            {
              label: <span className="inline-block size-4 rounded-[2px] bg-current" />,
              value: BlockShape.Square,
              tooltip: 'Square',
            },
            {
              label: <span className="inline-block size-4 rounded-full bg-current" />,
              value: BlockShape.Round,
              tooltip: 'Round',
            },
          ]}
          size="small"
          type="single"
          value={settings.blockShape}
          onValueChange={(shape) => {
            dispatchSettings({ type: 'blockShape', payload: shape as BlockShape })
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
