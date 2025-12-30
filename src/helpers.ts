import type { GitHubUsername, GraphData, ValuableStatistics } from '~/types'

/**
 * 将数字格式化为带千位分隔符的字符串
 * @param num - 要格式化的数字
 * @returns 格式化后的字符串，例如：1234567 -> "1,234,567"
 */
export function numberWithCommas(num: number): string {
  if (!Number.isFinite(num)) {
    return '0'
  }

  return new Intl.NumberFormat('en-US').format(num)
}

function getLocalIsoDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getCurrentYear(): number {
  // 使用本地时区获取当前年份；如果未来需要支持特定时区，可以在此统一调整
  const now = new Date()

  return now.getFullYear()
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

interface SearchParams {
  url: string
  paramName: string
  paramValue: string | string[]
}

export function setSearchParamsToUrl(params: SearchParams) {
  const { url, paramName, paramValue } = params

  if (paramValue) {
    const VirtualUrl = new URL(`https://x.com${url}`)

    if (Array.isArray(paramValue)) {
      paramValue.forEach((val) => {
        VirtualUrl.searchParams.append(paramName, val)
      })
    }
    else {
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
        }
        else {
          // If no contribution today, reset the streak.
          currentStreak = 0
        }
      })
    })
  })

  return { maxStreak, startDate, endDate }
}

/**
 * Options for calculating the longest contribution gap.
 *
 * Allow passing a custom "now" to make the function easier to test
 * and to support non-current time perspectives (e.g. historical reports).
 */
export interface LongestContributionGapOptions {
  /**
   * Optional base time used as the "current" moment.
   *
   * - If provided, its year will be used as the current year.
   * - If omitted, the helper will fall back to the system current year via getCurrentYear().
   */
  now?: Date
}

export function getLongestContributionGap(
  graphData: GraphData,
  options?: LongestContributionGapOptions,
): {
  maxGap: number
  startDate: string | null
  endDate: string | null
} {
  let currentGap = 0
  let maxGap = 0
  let startDate: string | null = null
  let endDate: string | null = null

  const now = options?.now ?? new Date()
  const currentYear
    = options?.now !== undefined
      ? options.now.getFullYear()
      : getCurrentYear()
  const todayLocalIso = getLocalIsoDateString(now)

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        const shouldIncludeDay
          = calendar.year !== currentYear
            || day.date <= todayLocalIso

        if (shouldIncludeDay) {
          if (day.level === 'NONE') {
            currentGap++
            maxGap = Math.max(maxGap, currentGap)

            if (currentGap === 1) {
              startDate = day.date
            }

            endDate = day.date
          }
          else {
            currentGap = 0
          }
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
        if (day.level !== 'NONE' && day.count > maxContributions) {
          maxContributions = day.count
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
export function getWeekendActivity(graphData: GraphData): { total: number, ratio: number } {
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
export interface ValuableStatisticsOptions {
  /**
   * Optional base time used as the "current" moment.
   *
   * - If provided, its year and date will be used as the current year and today.
   * - If omitted, the helper will fall back to the system current time.
   */
  now?: Date
}

export function getValuableStatistics(
  graphData: GraphData,
  options?: ValuableStatisticsOptions,
): ValuableStatistics {
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

  const now = options?.now ?? new Date()
  const currentYear
    = options?.now !== undefined
      ? options.now.getFullYear()
      : getCurrentYear()
  const todayLocalIso = getLocalIsoDateString(now)

  graphData.contributionCalendars.forEach((calendar) => {
    calendar.weeks.forEach((week) => {
      week.days.forEach((day) => {
        const shouldIncludeDay
          = calendar.year !== currentYear
            || day.date <= todayLocalIso

        if (shouldIncludeDay) {
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
          }
          else {
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
        }
      })
    })

    totalContributions += calendar.total
  })

  const averageContributionsPerDay
    = totalDays > 0
      ? Math.round(totalContributions / totalDays)
      : 0

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

export function normalizeGitHubUsername(input: string): GitHubUsername | null {
  const trimmed = input.trim()
  let normalized: GitHubUsername | null = null

  if (trimmed.length > 0) {
    const containsSlash = trimmed.includes('/')

    if (!containsSlash) {
      normalized = trimmed
    }
    else {
      const githubUrlPattern = /^https:\/\/github\.com\/([^/?#]+)(?:[/?#]|$)/
      const match = githubUrlPattern.exec(trimmed)

      const extracted = match?.[1]

      if (extracted) {
        normalized = extracted
      }
    }
  }

  return normalized
}

/**
 * 计算距今天数并返回相对时间描述
 * @param dateString - ISO 8601 格式的日期字符串
 * @param t - next-intl 翻译函数
 * @returns 相对时间描述，例如："今天"、"3天前"、"2个月前"
 */
export function getRelativeTime(
  dateString: string,
  t: (key: string, params?: Record<string, string | number | Date>) => string,
): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return t('relativeTime.today')
  }

  if (diffDays === 1) {
    return t('relativeTime.yesterday')
  }

  if (diffDays < 7) {
    return t('relativeTime.daysAgo', { count: diffDays })
  }

  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)

    return t('relativeTime.weeksAgo', { count: weeks })
  }

  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30)

    return t('relativeTime.monthsAgo', { count: months })
  }

  const years = Math.floor(diffDays / 365)

  return t('relativeTime.yearsAgo', { count: years })
}
