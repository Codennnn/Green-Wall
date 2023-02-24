import { RadixSelect } from '~/components/ui-kit/RadixSelect'
import { useData } from '~/DataContext'
import type { GraphData, GraphSettings } from '~/types'

interface YearRangeSelectProps {
  graphData: GraphData | undefined
}

export function YearRangeSelect(props: YearRangeSelectProps) {
  const { graphData } = props

  const { settings, dispatchSettings, firstYear, lastYear } = useData()

  let [startYear, endYear] = settings.yearRange ?? []
  startYear ||= firstYear
  endYear ||= lastYear

  if (!startYear || !endYear) {
    return null
  }

  const handleYearChange = (se: 'start' | 'end', year: string) => {
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
      <RadixSelect
        items={graphData?.contributionYears.map((year) => ({
          label: `${year}`,
          value: `${year}`,
          disabled: year > Number(endYear),
        }))}
        value={startYear}
        onValueChange={handleYearChange.bind(null, 'start')}
      />
      <span className="mx-2">-</span>
      <RadixSelect
        items={graphData?.contributionYears.map((year) => ({
          label: `${year}`,
          value: `${year}`,
          disabled: year < Number(startYear),
        }))}
        value={endYear}
        onValueChange={handleYearChange.bind(null, 'end')}
      />
    </div>
  )
}
