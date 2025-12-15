import type { ContributionCalendar } from '~/types'

export interface MonthlyChartData {
  /** 月份名称，如 "Jan", "Feb" */
  month: string
  /** 月份索引 0-11，用于排序 */
  monthIndex: number
  /** 该月提交总数 */
  count: number
  /** 是否为最大值 */
  isMax: boolean
}

export interface WeeklyChartData {
  /** 星期名称，如 "Mon", "Tue" */
  day: string
  /** 星期索引 0-6 (周日=0) */
  dayIndex: number
  /** 该星期几的提交总数 */
  count: number
  /** 是否为最大值 */
  isMax: boolean
}

export interface MonthlySummary {
  totalContributions: number
  maxMonth: string | null
  maxMonthCount: number
}

export interface WeeklySummary {
  mostActiveDay: string | null
  mostActiveDayCount: number
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function getMonthlyChartData(
  calendars: ContributionCalendar[] | undefined,
): { data: MonthlyChartData[], summary: MonthlySummary } {
  const monthlyCount: number[] = Array.from({ length: 12 }, () => 0)
  let totalContributions = 0

  if (calendars) {
    for (const calendar of calendars) {
      for (const week of calendar.weeks) {
        for (const day of week.days) {
          if (day.count > 0) {
            // 从日期字符串中提取月份 (格式: YYYY-MM-DD)
            const month = Number.parseInt(day.date.substring(5, 7), 10) - 1

            if (month >= 0 && month < 12) {
              monthlyCount[month] += day.count
              totalContributions += day.count
            }
          }
        }
      }
    }
  }

  const maxCount = Math.max(...monthlyCount)
  const maxMonthIndex = monthlyCount.indexOf(maxCount)

  const data: MonthlyChartData[] = MONTH_NAMES.map((month, index) => ({
    month,
    monthIndex: index,
    count: monthlyCount[index],
    isMax: monthlyCount[index] === maxCount && maxCount > 0,
  }))

  const summary: MonthlySummary = {
    totalContributions,
    maxMonth: maxCount > 0 ? MONTH_NAMES[maxMonthIndex] : null,
    maxMonthCount: maxCount,
  }

  return { data, summary }
}

export function getWeeklyChartData(
  calendars: ContributionCalendar[] | undefined,
): { data: WeeklyChartData[], summary: WeeklySummary } {
  const weeklyCount: number[] = Array.from({ length: 7 }, () => 0)

  if (calendars) {
    for (const calendar of calendars) {
      for (const week of calendar.weeks) {
        for (const day of week.days) {
          if (day.count > 0 && day.weekday !== undefined) {
            weeklyCount[day.weekday] += day.count
          }
        }
      }
    }
  }

  const maxCount = Math.max(...weeklyCount)
  const maxDayIndex = weeklyCount.indexOf(maxCount)

  const data: WeeklyChartData[] = DAY_NAMES.map((day, index) => ({
    day,
    dayIndex: index,
    count: weeklyCount[index],
    isMax: weeklyCount[index] === maxCount && maxCount > 0,
  }))

  const summary: WeeklySummary = {
    mostActiveDay: maxCount > 0 ? DAY_NAMES[maxDayIndex] : null,
    mostActiveDayCount: maxCount,
  }

  return { data, summary }
}
