import { endOfYear, getDay, startOfYear } from 'date-fns'

import { FAKE_DAYS, WEEKS_OF_YEAR } from './constants'
import type { Contribution, Year } from './types'

export function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function generateInvalidFakeContributions(year: Year): Contribution[] {
  const startWeekDayOfYear = getDay(startOfYear(new Date(year)))
  const endWeekDayOfYear = getDay(endOfYear(new Date(year)))

  return [...Array(WEEKS_OF_YEAR)].map((_, i) => {
    const week = i
    let fakeDays = FAKE_DAYS

    if (week === 0) {
      fakeDays = FAKE_DAYS.map((d, i) => (i < startWeekDayOfYear ? { count: 0, level: -1 } : d))
    } else if (week === WEEKS_OF_YEAR - 1) {
      fakeDays = FAKE_DAYS.map((d, i) => (i > endWeekDayOfYear ? { count: 0, level: -1 } : d))
    }

    return { week, days: fakeDays }
  })
}
