import { memo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import type { ContributionYear, GraphSettings } from '~/types'

type YearRange = NonNullable<GraphSettings['yearRange']>

interface YearRangeSelectProps {
  contributionYears: ContributionYear[]
  endYear: string | undefined
  startYear: string | undefined
  onChange: (yearRange: YearRange) => void
}

export const YearRangeSelect = memo(function YearRangeSelect({
  contributionYears,
  endYear,
  startYear,
  onChange,
}: YearRangeSelectProps) {
  if (!startYear || !endYear) {
    return null
  }

  function handleStartYearChange(year: string | null) {
    if (!year) {
      return
    }

    onChange([year, endYear])
  }

  function handleEndYearChange(year: string | null) {
    if (!year) {
      return
    }

    onChange([startYear, year])
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
          {contributionYears.map((year) => (
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
          {contributionYears.map((year) => (
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
