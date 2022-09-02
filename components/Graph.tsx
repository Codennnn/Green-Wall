import { memo, useMemo } from 'react'

import type { Contribution, RemoteData } from '../types'

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

interface DDD {
  total: number
  contributions: Contribution[]
}

interface GraphProps {
  data: RemoteData
  daysLabel?: boolean
}

const days = [...Array(7)].map(() => ({ count: 0, level: 0 }))

function Graph(props: GraphProps) {
  const res = useMemo<DDD>(() => {
    if (!props.data.contributions || !props.data.min || !props.data.max) {
      return { total: 0, contributions: [...Array(52)].map(() => ({ week: 0, days })) }
    }

    return props.data.contributions.reduce<DDD>(
      (res, item) => {
        res.contributions.push({
          week: item.week,
          days: item.days.map((day) => {
            res.total += day.count
            const level =
              day.count >= (props.data.p90 ?? Infinity)
                ? 4
                : day.count >= (props.data.p80 ?? Infinity)
                ? 3
                : day.count >= (props.data.median ?? Infinity)
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
        {props.data.year}: {numberWithCommas(res.total)} Contributions
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

        {props.daysLabel && (
          <ul className="days">
            <li>Sun</li>
            <li>Mon</li>
            <li>Tue</li>
            <li>Wed</li>
            <li>Thu</li>
            <li>Fri</li>
            <li>Sat</li>
          </ul>
        )}

        <ul className="squares">
          {res.contributions.reduce<React.ReactNode[]>((acc, week, i) => {
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
              acc.push(<li key={`${i}${j}`} className="day" data-level={day.level}></li>)
            })
            return acc
          }, [])}
        </ul>
      </div>
    </div>
  )
}

export default memo(Graph)
