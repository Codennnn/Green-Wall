import { useMemo } from 'react'

import type { Contribution, RemoteData } from '../types'
import EmptyGraph from './EmptyGraph'

interface GraphProps {
  data: RemoteData
}

export default function Graph(props: GraphProps) {
  const res = useMemo(() => {
    if (!props.data.contributions || props.data.min === null || props.data.max === null) {
      return
    }
    return props.data.contributions.reduce<{ total: number; contributions: Contribution[] }>(
      (res, item) => {
        res.contributions.push({
          week: item.week,
          days: item.days.map((day) => {
            res.total += day.count
            const level =
              day.count >= props.data.p90
                ? 4
                : day.count >= props.data.p80
                ? 3
                : day.count >= props.data.median
                ? 2
                : day.count >= props.data.min
                ? 1
                : 0
            return { count: day.count, level }
          }),
        })
        return res
      },
      { total: 0, contributions: [] }
    )
  }, [props.data])

  return (
    <div>
      <div className="mb-2 text-xs">
        {props.data.year}: {res?.total} Contributions
      </div>

      <div className="graph text-xs">
        <ul className="months">
          <li>Jan</li>
          <li>Feb</li>
          <li>Mar</li>
          <li>Apr</li>
          <li>May</li>
          <li>Jun</li>
          <li>Jul</li>
          <li>Aug</li>
          <li>Sep</li>
          <li>Oct</li>
          <li>Nov</li>
          <li>Dec</li>
        </ul>

        <ul className="days">
          <li>Sun</li>
          <li>Mon</li>
          <li>Tue</li>
          <li>Wed</li>
          <li>Thu</li>
          <li>Fri</li>
          <li>Sat</li>
        </ul>

        <ul className="squares">
          {res && res.contributions.length > 0 ? (
            res?.contributions.reduce<React.ReactNode[]>((res, week, i) => {
              let days = week.days

              if (days.length < 7) {
                const fills = Array.from(Array(7 - days.length)).map(() => ({
                  count: 0,
                  level: -1,
                }))
                if (week.week === 0) {
                  days = [...fills, ...week.days]
                } else {
                  days = [...week.days, ...fills]
                }
              }
              days.forEach((day, j) => {
                res.push(<li key={`${i}${j}`} className="day" data-level={day.level}></li>)
              })
              return res
            }, [])
          ) : (
            <EmptyGraph />
          )}
        </ul>
      </div>
    </div>
  )
}
