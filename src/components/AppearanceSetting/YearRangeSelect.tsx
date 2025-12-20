import { memo, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useData } from '~/DataContext'
import { eventTracker } from '~/lib/analytics'
import type { GraphData } from '~/types'

interface YearRangeSelectProps {
  graphData: GraphData | undefined
}

export const YearRangeSelect = memo(function YearRangeSelect(props: YearRangeSelectProps) {
  const { graphData } = props

  const { settings, dispatchSettings, firstYear, lastYear } = useData()

  const yearRange = useMemo(() => {
    let [startYear, endYear] = settings.yearRange ?? []
    startYear ??= firstYear
    endYear ??= lastYear

    return { startYear, endYear }
  }, [settings.yearRange, firstYear, lastYear])

  const { startYear, endYear } = yearRange

  const handleStartYearChange = useEvent(
    (year: string | null) => {
      if (!year) {
        return
      }

      eventTracker.ui.settings.change('year_range', `${year}-${endYear ?? ''}`)
      dispatchSettings({
        type: 'yearRange',
        payload: [year, endYear],
      })
    },
  )

  const handleEndYearChange = useEvent(
    (year: string | null) => {
      if (!year) {
        return
      }

      eventTracker.ui.settings.change('year_range', `${startYear ?? ''}-${year}`)
      dispatchSettings({
        type: 'yearRange',
        payload: [startYear, year],
      })
    },
  )

  if (!startYear || !endYear) {
    return null
  }

  return (
    <div className="flex items-center">
      <Select
        value={startYear}
        onValueChange={handleStartYearChange}
      >
        <SelectTrigger className="w-20 min-w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {graphData?.contributionYears.map((year) => (
            <SelectItem
              key={year}
              disabled={year > Number(endYear)}
              value={`${year}`}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="mx-2">-</span>

      <Select
        value={endYear}
        onValueChange={handleEndYearChange}
      >
        <SelectTrigger className="w-20 min-w-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {graphData?.contributionYears.map((year) => (
            <SelectItem
              key={year}
              disabled={year < Number(startYear)}
              value={`${year}`}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
})
