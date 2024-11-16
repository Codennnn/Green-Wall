import splitbee from '@splitbee/web'

import type { GraphData } from '~/types'

export function numberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const isDev: boolean = process.env.NODE_ENV === 'development'

export function trackEvent(
  event: string,
  data?: Record<string, string | number | boolean | undefined | null>
): void {
  if (isDev) {
    return
  }

  void splitbee.track(event, data)
}

interface SearchParams {
  url: string
  paramName: string
  paramValue: string | string[]
}

export function setSearchParamsToUrl(params: SearchParams) {
  const { url, paramName, paramValue } = params

  if (paramValue) {
    const VirtualUrl = new URL(`http://x.com${url}`)

    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        VirtualUrl.searchParams.append(paramName, val)
      })
    } else {
      VirtualUrl.searchParams.set(paramName, paramValue)
    }

    return VirtualUrl.toString().replace(VirtualUrl.origin, '')
  }

  return url
}

export function getLongestContributionStreak(graphData: GraphData): {
  maxStreak: number
  startDate: string | null
  endDate: string | null
} {
  // Current consecutive days.
  let currentStreak = 0
  // Maximum consecutive days.
  let maxStreak = 0

  let startDate: string | null = null
  let endDate: string | null = null

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.level !== 'NONE') {
          // If there's a contribution today, increment the streak.
          currentStreak++
          // Update the maximum streak.
          maxStreak = Math.max(maxStreak, currentStreak)

          if (currentStreak === 1) {
            startDate = day.date
          }

          endDate = day.date
        } else {
          // If no contribution today, reset the streak.
          currentStreak = 0
        }
      })
    })
  })

  return { maxStreak, startDate, endDate }
}

export function getLongestContributionGap(graphData: GraphData): {
  maxGap: number
  startDate: string | null
  endDate: string | null
} {
  let currentGap = 0
  let maxGap = 0
  let startDate: string | null = null
  let endDate: string | null = null

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.level === 'NONE') {
          currentGap++
          maxGap = Math.max(maxGap, currentGap)

          if (currentGap === 1) {
            startDate = day.date
          }

          endDate = day.date
        } else {
          currentGap = 0
        }
      })
    })
  })

  return { maxGap, startDate, endDate }
}

export function getMaxContributionsInADay(graphData: GraphData): {
  maxContributions: number
  maxDate: string | null
} {
  let maxContributions = 0
  let maxDate: string | null = null

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.level !== 'NONE') {
          maxContributions = Math.max(maxContributions, day.count)
          maxDate = day.date
        }
      })
    })
  })

  return { maxContributions, maxDate }
}

/**
 * Calculate the number of contributions made on weekends and their ratio to total contributions
 */
export function getWeekendActivity(graphData: GraphData): { total: number; ratio: number } {
  let countOnWeekends = 0
  let total = 0

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        const isWeekend = day.weekday === 0 || day.weekday === 6

        if (isWeekend) {
          if (day.level !== 'NONE') {
            countOnWeekends += day.count
          }
        }
      })
    })

    total += calendar.total
  })

  return {
    total: countOnWeekends,
    // Calculate the percentage of weekend contributions.
    // Round to nearest integer for cleaner display.
    ratio: Math.round((countOnWeekends / total) * 100),
  }
}

export function getValuableStatistics(graphData: GraphData) {
  let weekendContributions = 0
  let totalContributions = 0

  let longestStreak = 0
  let currentStreak = 0
  let longestStreakStartDate: string | null = null
  let longestStreakEndDate: string | null = null

  let longestGap = 0
  let currentGap = 0
  let longestGapStartDate: string | null = null
  let longestGapEndDate: string | null = null

  let maxContributionsInADay = 0
  let maxContributionsDate: string | null = null

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        const isWeekend = day.weekday === 0 || day.weekday === 6

        if (isWeekend) {
          weekendContributions += day.count
        }

        if (day.level !== 'NONE') {
          // If there's a contribution today, increment the streak.
          currentStreak++
          // Update the maximum streak.
          longestStreak = Math.max(longestStreak, currentStreak)

          if (currentStreak === 1) {
            longestStreakStartDate = day.date
          }

          longestStreakEndDate = day.date
        } else {
          // If no contribution today, reset the streak.
          currentStreak = 0
        }

        if (day.level !== 'NONE') {
          maxContributionsInADay = Math.max(maxContributionsInADay, day.count)
          maxContributionsDate = day.date
        }

        if (day.level === 'NONE') {
          currentGap++
          longestGap = Math.max(longestGap, currentGap)

          if (currentGap === 1) {
            longestGapStartDate = day.date
          }

          longestGapEndDate = day.date
        } else {
          currentGap = 0
        }
      })
    })

    totalContributions += calendar.total
  })

  return {
    weekendContributions,
    totalContributions,
    longestStreak,
    longestStreakStartDate,
    longestStreakEndDate,
    longestGap,
    longestGapStartDate,
    longestGapEndDate,
    maxContributionsInADay,
    maxContributionsDate,
  }
}
