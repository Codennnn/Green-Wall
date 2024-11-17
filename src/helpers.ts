import splitbee from '@splitbee/web'

import type { GraphData, ValuableStatistics } from '~/types'

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

/**
 * Calculate valuable statistics from contribution data including:
 * - Weekend contributions
 * - Longest contribution streak
 * - Longest gap between contributions
 * - Maximum contributions in a day
 * - Average contributions per day
 */
export function getValuableStatistics(graphData: GraphData): ValuableStatistics {
  let weekendContributions = 0
  let totalContributions = 0

  let longestStreak = 0
  let currentStreak = 0
  let longestStreakStartDate: string | undefined = undefined
  let longestStreakEndDate: string | undefined = undefined
  let currentStreakStartDate: string | undefined = undefined

  let longestGap = 0
  let currentGap = 0
  let longestGapStartDate: string | undefined = undefined
  let longestGapEndDate: string | undefined = undefined
  let currentGapStartDate: string | undefined = undefined

  let maxContributionsInADay = 0
  let maxContributionsDate: string | undefined = undefined

  let totalDays = 0

  // Add new variables for tracking monthly contributions
  const monthlyContributions: Record<string, number> = {}
  let maxContributionsMonth: string | undefined = undefined
  let maxMonthlyContributions = 0

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        totalDays++

        const isWeekend = day.weekday === 0 || day.weekday === 6

        if (isWeekend) {
          weekendContributions += day.count
        }

        if (day.level !== 'NONE') {
          // Start of a new streak.
          if (currentStreak === 0) {
            currentStreakStartDate = day.date
          }

          currentStreak++

          // Update longest streak if current streak is longer.
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak
            longestStreakStartDate = currentStreakStartDate
            longestStreakEndDate = day.date
          }

          // Reset gap tracking
          currentGap = 0
          currentGapStartDate = undefined
        } else {
          // Start of a new gap
          if (currentGap === 0) {
            currentGapStartDate = day.date
          }
          currentGap++

          // Update longest gap if current gap is longer.
          if (currentGap > longestGap) {
            longestGap = currentGap
            longestGapStartDate = currentGapStartDate
            longestGapEndDate = day.date
          }

          // Reset streak tracking.
          currentStreak = 0
          currentStreakStartDate = undefined
        }

        // Track maximum contributions in a day.
        if (day.level !== 'NONE' && day.count > maxContributionsInADay) {
          maxContributionsInADay = day.count
          maxContributionsDate = day.date
        }

        // Track monthly contributions.
        if (day.level !== 'NONE') {
          // Extract month from date (format: YYYY-MM-DD).
          const month = day.date.substring(0, 7) // Gets YYYY-MM.
          monthlyContributions[month] = (monthlyContributions[month] || 0) + day.count

          // Update max monthly contributions if this month has more.
          if (monthlyContributions[month] > maxMonthlyContributions) {
            maxMonthlyContributions = monthlyContributions[month]
            maxContributionsMonth = month
          }
        }
      })
    })

    totalContributions += calendar.total
  })

  const averageContributionsPerDay = Math.round(totalContributions / totalDays)

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
    averageContributionsPerDay,
    maxContributionsMonth,
    maxMonthlyContributions,
  }
}
