'use client'

import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useMemo,
  useState,
} from 'react'

import { DEFAULT_THEME, THEME_PRESETS } from '~/constants'
import { useGraphSetting } from '~/hooks/useGraphSetting'
import type { GitHubUsername, GraphData, GraphSettings, ThemePreset } from '~/types'

type DispatchSettings = ReturnType<typeof useGraphSetting>[1]

interface SettingContextData {
  username: GitHubUsername
  graphData: GraphData | undefined
  setGraphData: Dispatch<SetStateAction<GraphData | undefined>>
  settings: GraphSettings
  dispatchSettings: DispatchSettings
  firstYear: string | undefined
  lastYear: string | undefined
  totalYears: number | undefined
  totalContributions: number | undefined
  applyingTheme: ThemePreset | undefined
}

interface DataProviderProps extends React.PropsWithChildren {
  overrideSettings?: Partial<GraphSettings>
}

const Setting = createContext({} as SettingContextData)

export function DataProvider(props: DataProviderProps) {
  const { children, overrideSettings } = props

  const [graphData, setGraphData] = useState<GraphData>()

  const [settings, dispatchSettings] = useGraphSetting()

  // 合并覆盖设置（优先级：overrideSettings > settings）
  const finalSettings = useMemo(
    () => ({
      ...settings,
      ...overrideSettings,
    }),
    [settings, overrideSettings],
  )

  const derivedValues = useMemo(() => {
    const firstYear = graphData?.contributionYears.at(-1)?.toString()
    const lastYear = graphData?.contributionYears.at(0)?.toString()
    const totalYears = graphData?.contributionYears.length
    const totalContributions = graphData?.contributionCalendars.reduce(
      (sum, calendar) => sum + calendar.total,
      0,
    )
    const username = graphData?.login ?? ''

    return {
      username,
      firstYear,
      lastYear,
      totalYears,
      totalContributions,
    }
  }, [graphData])

  const applyingTheme = useMemo(
    () =>
      THEME_PRESETS.find(
        (item) => item.name.toLowerCase() === (finalSettings.theme ?? DEFAULT_THEME).toLowerCase(),
      ),
    [finalSettings.theme],
  )

  const contextValue = useMemo<SettingContextData>(
    () => ({
      username: derivedValues.username,
      graphData,
      setGraphData,
      settings: finalSettings,
      dispatchSettings,
      firstYear: derivedValues.firstYear,
      lastYear: derivedValues.lastYear,
      totalYears: derivedValues.totalYears,
      totalContributions: derivedValues.totalContributions,
      applyingTheme,
    }),
    [graphData, finalSettings, dispatchSettings, applyingTheme, derivedValues],
  )

  return (
    <Setting.Provider value={contextValue}>
      {children}
    </Setting.Provider>
  )
}

export function useData() {
  return useContext(Setting)
}
