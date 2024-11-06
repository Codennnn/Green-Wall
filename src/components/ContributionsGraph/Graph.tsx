import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { levels } from '~/constants'
import { useData } from '~/DataContext'
import { ContributionLevel } from '~/enums'
import { numberWithCommas } from '~/helpers'
import type { ContributionCalendar, ContributionDay } from '~/types'

import styles from './Graph.module.css'

interface GraphProps extends React.ComponentProps<'div'> {
  data: ContributionCalendar
  daysLabel?: boolean
  showInspect?: boolean
}

const newYearText = 'Happy New Year 🎉 Go make the first contribution !'

export function Graph(props: GraphProps) {
  const { data: calendar, daysLabel, showInspect = true, ...rest } = props

  const { username } = useData()

  const currentYear = new Date().getFullYear()
  const isNewYear =
    currentYear === calendar.year &&
    (new Date(currentYear, 0, 2).getTime() - Date.now()) / 1000 / 60 / 60 / 24 >= 0

  return (
    <div {...rest} className={`${rest.className || ''} group`}>
      <div className="mb-2 flex items-center">
        <div className="text-sm">
          <span className="mr-2 italic">{calendar.year}:</span>
          {isNewYear && calendar.total === 0
            ? newYearText
            : `${numberWithCommas(calendar.total)} Contributions`}
        </div>

        {showInspect && (
          <button className="ml-auto rounded bg-main-50 px-2 py-1 text-sm font-medium text-main-500 opacity-0 transition hover:bg-main-100 group-hover:opacity-100">
            <Link
              className="inline-flex items-center gap-0.5"
              href={`/year/${calendar.year}?username=${username}`}
              target="_blank"
            >
              <span>Inspect</span>
              <ChevronRight className="size-4" />
            </Link>
          </button>
        )}
      </div>

      <div className={styles['graph']}>
        <ul className={styles['months']}>
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

        {daysLabel && (
          <ul className={styles['days']}>
            <li>Sun</li>
            <li>Mon</li>
            <li>Tue</li>
            <li>Wed</li>
            <li>Thu</li>
            <li>Fri</li>
            <li>Sat</li>
          </ul>
        )}

        <ul className={`${styles['grids']} ${styles['blocks']}`}>
          {calendar.weeks.reduce<React.ReactElement[]>((blocks, week, i) => {
            let days = week.days

            if (days.length < 7) {
              const fills = Array.from(Array(7 - days.length)).map<ContributionDay>(() => ({
                level: ContributionLevel.Null,
                count: 0,
                date: '',
              }))
              if (i === 0) {
                days = [...fills, ...week.days]
              } else {
                days = [...week.days, ...fills]
              }
            }

            days.forEach((day, j) => {
              blocks.push(
                <li
                  key={`${i}${j}`}
                  data-level={levels[day.level]}
                  title={`${day.count} contributions in ${day.date}`}
                />
              )
            })

            return blocks
          }, [])}
        </ul>
      </div>
    </div>
  )
}
