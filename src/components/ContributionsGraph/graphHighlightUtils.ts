import type { ContributionDay } from '~/types'

/**
 * 高亮模式类型
 * - none: 无高亮
 * - longestStreak: 高亮最长连续贡献天数
 * - longestGappedSpan: 高亮最长带间隔的贡献跨度
 * - maxDay: 高亮贡献数最多的日期
 * - specificDate: 高亮指定的单个日期
 * - specificMonth: 高亮指定月份的所有日期
 * - longestGap: 高亮最长间隔（无贡献）的日期范围
 */
export type GraphHighlightMode
  = | 'none'
    | 'longestStreak'
    | 'longestGappedSpan'
    | 'maxDay'
    | 'specificDate'
    | 'specificMonth'
    | 'longestGap'

/**
 * 高亮选项配置
 */
export interface GraphHighlightOptions {
  /**
   * 对于 `longestGappedSpan` 模式：两个贡献日期之间允许的最大间隔天数
   * 例如：1 表示允许 1 天的间隔（日期差 <= 2 天）
   * @default 1
   */
  maxGapDays?: number
  /**
   * 对于 `specificDate` 模式：要高亮的具体日期（格式：YYYY-MM-DD）
   */
  specificDate?: string
  /**
   * 对于 `specificMonth` 模式：要高亮的具体月份（格式：YYYY-MM）
   */
  specificMonth?: string
  /**
   * 对于 `longestGap` 模式：最长间隔的起止日期
   */
  longestGapRange?: {
    start?: string
    end?: string
  }
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * 解析 UTC 日期字符串为毫秒时间戳
 * @param date 格式为 "YYYY-MM-DD" 的日期字符串
 * @returns UTC 毫秒时间戳，解析失败返回 null
 */
function parseUtcDateMs(date: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  let utcMs: number | null = null

  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])

    const candidate = Date.UTC(year, month - 1, day)
    const utcDate = new Date(candidate)

    const isValid
      = utcDate.getUTCFullYear() === year
        && utcDate.getUTCMonth() === month - 1
        && utcDate.getUTCDate() === day

    if (isValid) {
      utcMs = candidate
    }
  }

  return utcMs
}

/**
 * 计算最长连续贡献天数的日期范围
 */
function calculateLongestStreak(daysInYear: ContributionDay[]): {
  start?: string
  end?: string
} {
  let bestLen = 0
  let currentLen = 0
  let currentStart: string | undefined = undefined
  let bestRangeStart: string | undefined = undefined
  let bestRangeEnd: string | undefined = undefined

  daysInYear.forEach((day) => {
    const hasContributions = day.count > 0

    if (hasContributions) {
      if (currentLen === 0) {
        currentStart = day.date
      }

      currentLen++

      if (currentLen > bestLen) {
        bestLen = currentLen
        bestRangeStart = currentStart
        bestRangeEnd = day.date
      }
    }
    else {
      currentLen = 0
      currentStart = undefined
    }
  })

  return {
    start: bestRangeStart,
    end: bestRangeEnd,
  }
}

/**
 * 计算最长带间隔的贡献跨度日期范围
 */
function calculateLongestGappedSpan(
  daysInYear: ContributionDay[],
  maxGapDays: number,
): {
  start?: string
  end?: string
} {
  const contributionDates = daysInYear
    .filter((day) => day.count > 0)
    .map((day) => day.date)

  let bestSpanDays = 0
  let segmentStartIndex = 0
  let bestSegmentStartIndex = 0
  let bestSegmentEndIndex = 0

  for (let i = 1; i < contributionDates.length; i++) {
    const prev = contributionDates[i - 1]
    const current = contributionDates[i]

    const prevMs = parseUtcDateMs(prev)
    const currentMs = parseUtcDateMs(current)

    let shouldSplit = true

    if (prevMs !== null && currentMs !== null) {
      const diffDays = Math.round((currentMs - prevMs) / MS_PER_DAY)
      shouldSplit = diffDays > maxGapDays + 1
    }

    if (shouldSplit) {
      const startDate = contributionDates[segmentStartIndex]
      const endDate = contributionDates[i - 1]

      const startMs = parseUtcDateMs(startDate)
      const endMs = parseUtcDateMs(endDate)

      if (startMs !== null && endMs !== null) {
        const spanDays = Math.round((endMs - startMs) / MS_PER_DAY) + 1
        const segmentStartDate = contributionDates[segmentStartIndex]
        const bestSegmentStartDate = contributionDates[bestSegmentStartIndex]
        const shouldReplace
          = spanDays > bestSpanDays
            || (spanDays === bestSpanDays
              && segmentStartDate < bestSegmentStartDate)

        if (shouldReplace) {
          bestSpanDays = spanDays
          bestSegmentStartIndex = segmentStartIndex
          bestSegmentEndIndex = i - 1
        }
      }

      segmentStartIndex = i
    }
  }

  if (contributionDates.length > 0) {
    const startDate = contributionDates[segmentStartIndex]
    const endDate = contributionDates[contributionDates.length - 1]

    const startMs = parseUtcDateMs(startDate)
    const endMs = parseUtcDateMs(endDate)

    if (startMs !== null && endMs !== null) {
      const spanDays = Math.round((endMs - startMs) / MS_PER_DAY) + 1
      const segmentStartDate = contributionDates[segmentStartIndex]
      const bestSegmentStartDate = contributionDates[bestSegmentStartIndex]
      const shouldReplace
        = spanDays > bestSpanDays
          || (spanDays === bestSpanDays
            && segmentStartDate < bestSegmentStartDate)

      if (shouldReplace) {
        bestSpanDays = spanDays
        bestSegmentStartIndex = segmentStartIndex
        bestSegmentEndIndex = contributionDates.length - 1
      }
    }
  }

  return {
    start: contributionDates[bestSegmentStartIndex],
    end: contributionDates[bestSegmentEndIndex],
  }
}

/**
 * 计算贡献数最多的日期集合
 */
function calculateMaxDays(daysInYear: ContributionDay[]): Set<string> {
  const set = new Set<string>()
  let maxCount = 0

  daysInYear.forEach((day) => {
    if (day.count > maxCount) {
      maxCount = day.count
    }
  })

  if (maxCount > 0) {
    daysInYear.forEach((day) => {
      if (day.count === maxCount) {
        set.add(day.date)
      }
    })
  }

  return set
}

/**
 * 根据日期范围生成日期集合
 */
function createDateRangeSet(
  daysInYear: ContributionDay[],
  rangeStart?: string,
  rangeEnd?: string,
): Set<string> {
  const set = new Set<string>()

  if (rangeStart && rangeEnd) {
    daysInYear.forEach((day) => {
      if (day.date >= rangeStart && day.date <= rangeEnd) {
        set.add(day.date)
      }
    })
  }

  return set
}

/**
 * 计算需要高亮的日期集合
 * @param daysInYear 按日期排序的全年贡献数据
 * @param highlightMode 高亮模式
 * @param highlightOptions 高亮选项
 * @returns 需要高亮的日期集合
 */
export function calculateHighlightDates(
  daysInYear: ContributionDay[],
  highlightMode: GraphHighlightMode = 'none',
  highlightOptions?: GraphHighlightOptions,
): Set<string> {
  if (highlightMode === 'none') {
    return new Set<string>()
  }

  let maxGapDays = highlightOptions?.maxGapDays ?? 1

  if (!Number.isFinite(maxGapDays) || maxGapDays < 0) {
    maxGapDays = 1
  }

  maxGapDays = Math.floor(maxGapDays)

  if (highlightMode === 'maxDay') {
    return calculateMaxDays(daysInYear)
  }

  if (highlightMode === 'longestStreak') {
    const { start, end } = calculateLongestStreak(daysInYear)

    return createDateRangeSet(daysInYear, start, end)
  }

  if (highlightMode === 'longestGappedSpan') {
    const { start, end } = calculateLongestGappedSpan(daysInYear, maxGapDays)

    return createDateRangeSet(daysInYear, start, end)
  }

  if (highlightMode === 'specificDate') {
    const set = new Set<string>()
    const targetDate = highlightOptions?.specificDate

    if (targetDate) {
      set.add(targetDate)
    }

    return set
  }

  if (highlightMode === 'specificMonth') {
    const set = new Set<string>()
    const targetMonth = highlightOptions?.specificMonth

    if (targetMonth) {
      daysInYear.forEach((day) => {
        if (day.date.startsWith(targetMonth)) {
          set.add(day.date)
        }
      })
    }

    return set
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (highlightMode === 'longestGap') {
    const { start, end } = highlightOptions?.longestGapRange ?? {}

    return createDateRangeSet(daysInYear, start, end)
  }

  return new Set<string>()
}

/**
 * 将贡献日历数据展平并排序
 * @param weeks 周数据数组
 * @returns 按日期排序的全年贡献数据
 */
export function flattenAndSortDays(
  weeks: { days: ContributionDay[] }[],
): ContributionDay[] {
  const flattened: ContributionDay[] = []

  weeks.forEach((week) => {
    week.days.forEach((day) => {
      if (day.date) {
        flattened.push(day)
      }
    })
  })

  flattened.sort((a, b) => a.date.localeCompare(b.date))

  return flattened
}
