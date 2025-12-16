import { memo, useId } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import { CircleHelpIcon } from 'lucide-react'

import { ThemeSelector } from '~/components/ThemeSelector'
import { Switch } from '~/components/ui/switch'
import { Toggle, ToggleGroup } from '~/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useData } from '~/DataContext'
import { BlockShape, GraphSize } from '~/enums'
import { trackEvent } from '~/helpers'
import type { Themes } from '~/types'

import { YearRangeSelect } from './YearRangeSelect'

export const AppearanceSetting = memo(function AppearanceSetting() {
  const t = useTranslations('settings')
  const { graphData, settings, dispatchSettings } = useData()

  const daysLabelId = useId()
  const safariHeader = useId()
  const attributionId = useId()

  const handleDaysLabelChange = useEvent(
    (checked: boolean) => {
      dispatchSettings({ type: 'daysLabel', payload: checked })
    },
  )

  const handleSafariHeaderChange = useEvent(
    (checked: boolean) => {
      dispatchSettings({ type: 'showSafariHeader', payload: checked })
    },
  )

  const handleAttributionChange = useEvent(
    (checked: boolean) => {
      dispatchSettings({ type: 'showAttribution', payload: checked })
    },
  )

  const handleSizeChange = useEvent(
    (size: string[]) => {
      dispatchSettings({ type: 'size', payload: size[0] as GraphSize })
    },
  )

  const handleBlockShapeChange = useEvent(
    (shape: string[]) => {
      dispatchSettings({
        type: 'blockShape',
        payload: shape[0] as BlockShape,
      })
    },
  )

  const handleThemeChange = useEvent(
    (theme: Themes) => {
      trackEvent('Change theme', { themeName: theme })
      dispatchSettings({ type: 'theme', payload: theme })
    },
  )

  return (
    <div className="appearance-setting min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-muted-foreground">
      <fieldset>
        <label>{t('yearRange')}</label>
        <YearRangeSelect graphData={graphData} />
      </fieldset>

      <fieldset>
        <label htmlFor={daysLabelId}>{t('daysLabel')}</label>
        <Switch
          checked={settings.daysLabel}
          defaultChecked={true}
          id={daysLabelId}
          onCheckedChange={handleDaysLabelChange}
        />
      </fieldset>

      <fieldset>
        <label htmlFor={safariHeader}>{t('safariHeader')}</label>
        <Switch
          checked={settings.showSafariHeader}
          defaultChecked={true}
          id={safariHeader}
          onCheckedChange={handleSafariHeaderChange}
        />
      </fieldset>

      <fieldset>
        <label htmlFor={attributionId}>{t('attribution')}</label>
        <Switch
          checked={settings.showAttribution}
          defaultChecked={true}
          id={attributionId}
          onCheckedChange={handleAttributionChange}
        />
      </fieldset>

      <fieldset>
        <label className="flex items-center">
          {t('graphSize')}
          <Tooltip>
            <TooltipTrigger>
              <CircleHelpIcon className="ml-1 inline-block size-4 cursor-help opacity-90" />
            </TooltipTrigger>
            <TooltipContent>
              <span className="inline-block max-w-xs leading-5">
                {t('sizeHint')}
              </span>
            </TooltipContent>
          </Tooltip>
        </label>
        <ToggleGroup
          value={[settings.size]}
          onValueChange={handleSizeChange}
        >
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={GraphSize.Small} />}>
              S
            </TooltipTrigger>
            <TooltipContent>{t('sizeSmall')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={GraphSize.Medium} />}>
              M
            </TooltipTrigger>
            <TooltipContent>{t('sizeMedium')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={GraphSize.Large} />}>
              L
            </TooltipTrigger>
            <TooltipContent>{t('sizeLarge')}</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </fieldset>

      <fieldset>
        <label className="flex items-center">{t('blockShape')}</label>
        <ToggleGroup
          value={[settings.blockShape]}
          onValueChange={handleBlockShapeChange}
        >
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={BlockShape.Square} />}>
              <span className="inline-block size-4 rounded-[2px] bg-current" />
            </TooltipTrigger>
            <TooltipContent>{t('shapeSquare')}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={BlockShape.Round} />}>
              <span className="inline-block size-4 rounded-full bg-current" />
            </TooltipTrigger>
            <TooltipContent>{t('shapeRound')}</TooltipContent>
          </Tooltip>
        </ToggleGroup>
      </fieldset>

      <fieldset className="flex-col items-start">
        <label>{t('themes')}</label>
        <ThemeSelector
          className="mt-3 pl-1"
          value={settings.theme}
          onChange={handleThemeChange}
        />
      </fieldset>
    </div>
  )
})
