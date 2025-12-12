import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useData } from '~/DataContext'
import type { GraphData, GraphSettings } from '~/types'

interface YearRangeSelectProps {
  graphData: GraphData | undefined
}

export function YearRangeSelect(props: YearRangeSelectProps) {
  const { graphData } = props

  const { settings, dispatchSettings, firstYear, lastYear } = useData()

  let [startYear, endYear] = settings.yearRange ?? []
  startYear ??= firstYear
  endYear ??= lastYear

  if (!startYear || !endYear) {
    return null
  }

  const handleYearChange = (se: 'start' | 'end', year: string | null) => {
    if (!year) {
      return
    }

    let payload: GraphSettings['yearRange'] = undefined

    if (se === 'start') {
      payload = [year, endYear]
    }

    if (se === 'end') {
      payload = [startYear, year]
    }

    dispatchSettings({
      type: 'yearRange',
      payload,
    })
  }

  return (
    <div className="flex items-center">
      <Select
        value={startYear}
        onValueChange={handleYearChange.bind(null, 'start')}
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
        onValueChange={handleYearChange.bind(null, 'end')}
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
}
