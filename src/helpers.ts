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

  // Iterate through all years of data.
  graphData.contributionCalendars.forEach((calendar) => {
    // Iterate through each week.
    calendar.weeks.forEach((week) => {
      // Iterate through each day.
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

export function getMaxContributionsInADay(graphData: GraphData): { maxContributions: number } {
  let maxContributions = 0

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        if (day.level !== 'NONE') {
          maxContributions = Math.max(maxContributions, day.count)
        }
      })
    })
  })

  return { maxContributions }
}
