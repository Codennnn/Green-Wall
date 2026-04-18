import { memo, type ReactNode, startTransition, useId, useOptimistic } from 'react'

import { useTranslations } from 'next-intl'
import { CircleHelpIcon } from 'lucide-react'

import { ThemeSelector } from '~/components/ThemeSelector'
import { Switch } from '~/components/ui/switch'
import { Toggle, ToggleGroup } from '~/components/ui/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { DEFAULT_BLOCK_SHAPE, DEFAULT_SIZE } from '~/constants'
import { useData } from '~/DataContext'
import { BlockShape, GraphSize } from '~/enums'
import type { GraphSettingAction } from '~/hooks/useGraphSetting'
import { eventTracker } from '~/lib/analytics'
import type { GraphSettings, Themes } from '~/types'

import { YearRangeSelect } from './YearRangeSelect'

type BooleanSettingAction = Extract<
  GraphSettingAction,
  {
    payload?: boolean
  }
>

interface SettingSwitchFieldProps {
  checked: boolean
  id: string
  label: ReactNode
  onCheckedChange: (checked: boolean) => void
}

function SettingSwitchField({
  checked,
  id,
  label,
  onCheckedChange,
}: SettingSwitchFieldProps) {
  return (
    <fieldset>
      <label htmlFor={id}>{label}</label>
      <Switch
        checked={checked}
        id={id}
        onCheckedChange={onCheckedChange}
      />
    </fieldset>
  )
}

export const AppearanceSetting = memo(function AppearanceSetting() {
  const t = useTranslations('settings')

  const {
    firstYear,
    graphData,
    lastYear,
    settings,
    dispatchSettings,
  } = useData()

  const [optimisticSettings, updateOptimisticSettings] = useOptimistic(
    settings,
    (currentSettings: GraphSettings, patch: Partial<GraphSettings>) => ({
      ...currentSettings,
      ...patch,
    }),
  )

  const daysLabelId = useId()
  const safariHeaderId = useId()
  const attributionId = useId()
  const globalScaleId = useId()

  const [configuredStartYear, configuredEndYear] = optimisticSettings.yearRange ?? []
  const startYear = configuredStartYear ?? firstYear
  const endYear = configuredEndYear ?? lastYear
  const size = optimisticSettings.size ?? DEFAULT_SIZE
  const blockShape = optimisticSettings.blockShape ?? DEFAULT_BLOCK_SHAPE
  const daysLabel = optimisticSettings.daysLabel ?? false
  const showSafariHeader = optimisticSettings.showSafariHeader ?? true
  const showAttribution = optimisticSettings.showAttribution ?? true
  const globalScale = optimisticSettings.globalScale ?? false

  function commitSettingsChange(
    action: GraphSettingAction,
    optimisticPatch: Partial<GraphSettings>,
  ) {
    startTransition(() => {
      updateOptimisticSettings(optimisticPatch)
      dispatchSettings(action)
    })
  }

  function updateBooleanSetting(
    actionType: BooleanSettingAction['type'],
    settingKey: 'daysLabel' | 'showSafariHeader' | 'showAttribution' | 'globalScale',
    trackingKey: string,
    checked: boolean,
  ) {
    if (optimisticSettings[settingKey] === checked) {
      return
    }

    eventTracker.ui.settings.change(trackingKey, checked)
    commitSettingsChange(
      { type: actionType, payload: checked } as BooleanSettingAction,
      { [settingKey]: checked },
    )
  }

  function handleDaysLabelChange(checked: boolean) {
    if (daysLabel === checked) {
      return
    }

    updateBooleanSetting('daysLabel', 'daysLabel', 'days_label', checked)
  }

  function handleSafariHeaderChange(checked: boolean) {
    if (showSafariHeader === checked) {
      return
    }

    updateBooleanSetting('showSafariHeader', 'showSafariHeader', 'show_safari_header', checked)
  }

  function handleAttributionChange(checked: boolean) {
    if (showAttribution === checked) {
      return
    }

    updateBooleanSetting('showAttribution', 'showAttribution', 'show_attribution', checked)
  }

  function handleGlobalScaleChange(checked: boolean) {
    if (globalScale === checked) {
      return
    }

    updateBooleanSetting('globalScale', 'globalScale', 'global_scale', checked)
  }

  function handleSizeChange(nextSizeValues: string[]) {
    const nextSize = nextSizeValues[0] as GraphSize | undefined

    if (!nextSize || size === nextSize) {
      return
    }

    eventTracker.ui.settings.change('graph_size', nextSize)
    commitSettingsChange(
      { type: 'size', payload: nextSize },
      { size: nextSize },
    )
  }

  function handleBlockShapeChange(nextShapeValues: string[]) {
    const nextBlockShape = nextShapeValues[0] as BlockShape | undefined

    if (!nextBlockShape || blockShape === nextBlockShape) {
      return
    }

    eventTracker.ui.settings.change('block_shape', nextBlockShape)
    commitSettingsChange(
      { type: 'blockShape', payload: nextBlockShape },
      { blockShape: nextBlockShape },
    )
  }

  function handleThemeChange(theme: Themes) {
    if (optimisticSettings.theme === theme) {
      return
    }

    eventTracker.ui.theme.change(theme)
    eventTracker.ui.settings.change('theme', theme)
    commitSettingsChange(
      { type: 'theme', payload: theme },
      { theme },
    )
  }

  function handleYearRangeChange(yearRange: NonNullable<GraphSettings['yearRange']>) {
    if (
      optimisticSettings.yearRange?.[0] === yearRange[0]
      && optimisticSettings.yearRange?.[1] === yearRange[1]
    ) {
      return
    }

    eventTracker.ui.settings.change('year_range', `${yearRange[0] ?? ''}-${yearRange[1] ?? ''}`)
    commitSettingsChange(
      { type: 'yearRange', payload: yearRange },
      { yearRange },
    )
  }

  return (
    <div className="appearance-setting min-w-[min(40vw,220px)] max-w-[min(90vw,280px)] text-muted-foreground space-y-2">
      <fieldset>
        <label>{t('yearRange')}</label>
        <YearRangeSelect
          contributionYears={graphData?.contributionYears ?? []}
          endYear={endYear}
          startYear={startYear}
          onChange={handleYearRangeChange}
        />
      </fieldset>

      <SettingSwitchField
        checked={daysLabel}
        id={daysLabelId}
        label={t('daysLabel')}
        onCheckedChange={handleDaysLabelChange}
      />

      <SettingSwitchField
        checked={showSafariHeader}
        id={safariHeaderId}
        label={t('safariHeader')}
        onCheckedChange={handleSafariHeaderChange}
      />

      <SettingSwitchField
        checked={showAttribution}
        id={attributionId}
        label={t('attribution')}
        onCheckedChange={handleAttributionChange}
      />

      <SettingSwitchField
        checked={globalScale}
        id={globalScaleId}
        label={(
          <span className="flex items-center gap-1">
            {t('globalScale')}
            <Tooltip>
              <TooltipTrigger className="leading-none">
                <CircleHelpIcon className="inline-block size-4 cursor-help opacity-90" />
              </TooltipTrigger>
              <TooltipContent>
                <span className="inline-block max-w-xs leading-5">
                  {t('globalScaleHint')}
                </span>
              </TooltipContent>
            </Tooltip>
          </span>
        )}
        onCheckedChange={handleGlobalScaleChange}
      />

      <fieldset>
        <label className="flex items-center gap-1">
          {t('graphSize')}
          <Tooltip>
            <TooltipTrigger className="leading-none">
              <CircleHelpIcon className="inline-block size-4 cursor-help opacity-90" />
            </TooltipTrigger>
            <TooltipContent>
              <span className="inline-block max-w-xs leading-5">
                {t('sizeHint')}
              </span>
            </TooltipContent>
          </Tooltip>
        </label>
        <ToggleGroup
          value={[size]}
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
          value={[blockShape]}
          onValueChange={handleBlockShapeChange}
        >
          <Tooltip>
            <TooltipTrigger render={<Toggle size="sm" value={BlockShape.Square} />}>
              <span className="inline-block size-4 rounded-md bg-current" />
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
          value={optimisticSettings.theme}
          onChange={handleThemeChange}
        />
      </fieldset>
    </div>
  )
})
