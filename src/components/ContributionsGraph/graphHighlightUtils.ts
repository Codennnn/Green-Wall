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
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

interface DateRange {
  start?: string
  end?: string
}

/**
 * 解析 UTC 日期字符串为毫秒时间戳
 * @param date 格式为 "YYYY-MM-DD" 的日期字符串
 * @returns UTC 毫秒时间戳，解析失败返回 null
 */
function parseUtcDateMs(date: string): number | null {
  const match = DATE_PATTERN.exec(date)
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

function getInclusiveDaySpan(startMs: number, endMs: number): number {
  return Math.round((endMs - startMs) / MS_PER_DAY) + 1
}

function shouldReplaceRange(
  candidateSpanDays: number,
  candidateStart: string,
  bestSpanDays: number,
  bestStart: string | undefined,
): boolean {
  return (
    candidateSpanDays > bestSpanDays
    || (candidateSpanDays === bestSpanDays
      && (bestStart === undefined || candidateStart < bestStart))
  )
}

function normalizeMaxGapDays(maxGapDays: number | undefined): number {
  if (
    !Number.isFinite(maxGapDays)
    || maxGapDays === undefined
    || maxGapDays < 0
  ) {
    return 1
  }

  return Math.floor(maxGapDays)
}

/**
 * 计算最长连续贡献天数的日期范围
 */
function calculateLongestStreak(daysInYear: ContributionDay[]): DateRange {
  let bestLen = 0
  let currentLen = 0
  let currentStart: string | undefined = undefined
  let bestRangeStart: string | undefined = undefined
  let bestRangeEnd: string | undefined = undefined
  let previousContributionMs: number | null = null

  for (const day of daysInYear) {
    const currentMs = day.date ? parseUtcDateMs(day.date) : null
    const hasContributions = day.count > 0 && currentMs !== null

    if (hasContributions) {
      const continuesStreak
        = previousContributionMs !== null
          && currentMs - previousContributionMs === MS_PER_DAY

      if (!continuesStreak) {
        currentLen = 0
        currentStart = day.date
      }

      currentLen++
      previousContributionMs = currentMs

      if (currentLen > bestLen) {
        bestLen = currentLen
        bestRangeStart = currentStart
        bestRangeEnd = day.date
      }
    }
    else {
      currentLen = 0
      currentStart = undefined
      previousContributionMs = null
    }
  }

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
): DateRange {
  let bestSpanDays = 0
  let bestStart: string | undefined = undefined
  let bestEnd: string | undefined = undefined
  let segmentStart: string | undefined = undefined
  let segmentStartMs = 0
  let previousContributionDate: string | undefined = undefined
  let previousContributionMs = 0

  const commitSegment = () => {
    if (segmentStart === undefined || previousContributionDate === undefined) {
      return
    }

    const spanDays = getInclusiveDaySpan(
      segmentStartMs,
      previousContributionMs,
    )

    if (shouldReplaceRange(spanDays, segmentStart, bestSpanDays, bestStart)) {
      bestSpanDays = spanDays
      bestStart = segmentStart
      bestEnd = previousContributionDate
    }
  }

  for (const day of daysInYear) {
    if (day.count <= 0 || !day.date) {
      continue
    }

    const currentMs = parseUtcDateMs(day.date)

    if (currentMs === null) {
      continue
    }

    if (segmentStart === undefined) {
      segmentStart = day.date
      segmentStartMs = currentMs
    }
    else {
      const diffDays = Math.round(
        (currentMs - previousContributionMs) / MS_PER_DAY,
      )

      if (diffDays > maxGapDays + 1) {
        commitSegment()
        segmentStart = day.date
        segmentStartMs = currentMs
      }
    }

    previousContributionDate = day.date
    previousContributionMs = currentMs
  }

  commitSegment()

  return {
    start: bestStart,
    end: bestEnd,
  }
}

/**
 * 计算贡献数最多的日期集合
 */
function calculateMaxDays(daysInYear: ContributionDay[]): Set<string> {
  const set = new Set<string>()
  let maxCount = 0

  for (const day of daysInYear) {
    if (day.count > maxCount) {
      maxCount = day.count
      set.clear()
    }

    if (maxCount > 0 && day.count === maxCount) {
      set.add(day.date)
    }
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

  if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
    return set
  }

  for (const day of daysInYear) {
    if (!day.date || day.date < rangeStart) {
      continue
    }

    if (day.date > rangeEnd) {
      break
    }

    set.add(day.date)
  }

  return set
}

function createMonthSet(
  daysInYear: ContributionDay[],
  targetMonth: string | undefined,
): Set<string> {
  const set = new Set<string>()

  if (!targetMonth) {
    return set
  }

  for (const day of daysInYear) {
    const month = day.date.slice(0, 7)

    if (month < targetMonth) {
      continue
    }

    if (month > targetMonth) {
      break
    }

    set.add(day.date)
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
  switch (highlightMode) {
    case 'none':
      return new Set<string>()

    case 'maxDay':
      return calculateMaxDays(daysInYear)

    case 'longestStreak': {
      const { start, end } = calculateLongestStreak(daysInYear)

      return createDateRangeSet(daysInYear, start, end)
    }

    case 'longestGappedSpan': {
      const maxGapDays = normalizeMaxGapDays(highlightOptions?.maxGapDays)
      const { start, end } = calculateLongestGappedSpan(daysInYear, maxGapDays)

      return createDateRangeSet(daysInYear, start, end)
    }

    case 'specificDate': {
      const set = new Set<string>()
      const targetDate = highlightOptions?.specificDate

      if (targetDate) {
        set.add(targetDate)
      }

      return set
    }

    case 'specificMonth':
      return createMonthSet(daysInYear, highlightOptions?.specificMonth)

    case 'longestGap': {
      const { start, end } = highlightOptions?.longestGapRange ?? {}

      return createDateRangeSet(daysInYear, start, end)
    }

    default: {
      const exhaustiveMode: never = highlightMode
      void exhaustiveMode

      return new Set<string>()
    }
  }
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
  let previousDate = ''
  let isSorted = true

  for (const week of weeks) {
    for (const day of week.days) {
      if (day.date) {
        if (previousDate && day.date < previousDate) {
          isSorted = false
        }

        flattened.push(day)
        previousDate = day.date
      }
    }
  }

  if (!isSorted) {
    flattened.sort((a, b) => a.date.localeCompare(b.date))
  }

  return flattened
}
