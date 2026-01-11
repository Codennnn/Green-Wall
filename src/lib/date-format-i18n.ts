/** 月份缩写类型 */
export type MonthAbbr
  = 'Jan'
    | 'Feb'
    | 'Mar'
    | 'Apr'
    | 'May'
    | 'Jun'
    | 'Jul'
    | 'Aug'
    | 'Sep'
    | 'Oct'
    | 'Nov'
    | 'Dec'

/** 星期缩写类型 */
export type WeekdayAbbr = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat'

/** 翻译函数类型 */
export type Translator = (key: string) => string

/** 日期格式化器接口 */
export interface DateFormatters {
  /** 格式化日期为友好显示格式，如 "Jan 15" 或 "1月 15" */
  formatDate: (date: string | undefined) => string
  /** 格式化月份为友好显示格式，如 "Jan 2024" 或 "2024年1月" */
  formatMonth: (month: string | undefined) => string
  /** 格式化日期范围 */
  formatDateRange: (
    startDate: string | undefined,
    endDate: string | undefined,
  ) => string | undefined
}

// ============================================================================
// 常量映射
// ============================================================================

/** 月份数字到英文缩写的映射（1-12） */
const MONTH_NUMBER_TO_ABBR: Record<number, MonthAbbr> = {
  1: 'Jan',
  2: 'Feb',
  3: 'Mar',
  4: 'Apr',
  5: 'May',
  6: 'Jun',
  7: 'Jul',
  8: 'Aug',
  9: 'Sep',
  10: 'Oct',
  11: 'Nov',
  12: 'Dec',
}

/** 月份英文缩写到翻译 key 的映射 */
const MONTH_ABBR_TO_KEY: Record<MonthAbbr, string> = {
  Jan: 'jan',
  Feb: 'feb',
  Mar: 'mar',
  Apr: 'apr',
  May: 'may',
  Jun: 'jun',
  Jul: 'jul',
  Aug: 'aug',
  Sep: 'sep',
  Oct: 'oct',
  Nov: 'nov',
  Dec: 'dec',
}

/** 默认占位符 */
const DEFAULT_PLACEHOLDER = '-'

// ============================================================================
// 内部工具函数
// ============================================================================

interface ParsedDate {
  year: number
  month: number
  day: number
}

interface ParsedMonth {
  year: number
  month: number
}

/**
 * 解析 YYYY-MM-DD 格式的日期字符串
 * @param date - 日期字符串
 * @returns 解析结果，包含年月日；如果无效返回 null
 */
function parseDateString(date: string): ParsedDate | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  let result: ParsedDate | null = null

  if (match) {
    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])

    // 验证日期有效性
    const utcDate = new Date(Date.UTC(year, month - 1, day))
    const isValidDate
      = utcDate.getUTCFullYear() === year
        && utcDate.getUTCMonth() === month - 1
        && utcDate.getUTCDate() === day

    if (isValidDate) {
      result = { year, month, day }
    }
  }

  return result
}

/**
 * 解析 YYYY-MM 格式的月份字符串
 * @param month - 月份字符串
 * @returns 解析结果，包含年月；如果无效返回 null
 */
function parseMonthString(month: string): ParsedMonth | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  let result: ParsedMonth | null = null

  if (match) {
    const year = Number(match[1])
    const monthNumber = Number(match[2])

    if (monthNumber >= 1 && monthNumber <= 12) {
      result = { year, month: monthNumber }
    }
  }

  return result
}

/**
 * 获取本地化的月份名称
 * @param monthNumber - 月份数字 (1-12)
 * @param tMonths - 月份翻译函数
 * @returns 本地化的月份名称
 */
function getLocalizedMonthName(monthNumber: number, tMonths: Translator): string {
  const abbr = MONTH_NUMBER_TO_ABBR[monthNumber]
  const key = MONTH_ABBR_TO_KEY[abbr]

  return tMonths(key)
}

/**
 * 创建日期格式化函数（支持 i18n）
 *
 * @param tMonths - 月份翻译函数，通常来自 useTranslations('months')
 * @returns 格式化日期的函数
 *
 * @example
 * ```tsx
 * const tMonths = useTranslations('months')
 * const formatDate = createDateFormatter(tMonths)
 * formatDate('2024-01-15') // => "1月 15" (zh) or "Jan 15" (en)
 * ```
 */
export function createDateFormatter(tMonths: Translator): (date: string | undefined) => string {
  return (date: string | undefined): string => {
    if (!date) {
      return DEFAULT_PLACEHOLDER
    }

    const parsed = parseDateString(date)

    if (!parsed) {
      return DEFAULT_PLACEHOLDER
    }

    const monthName = getLocalizedMonthName(parsed.month, tMonths)
    const isChineseStyleMonth = monthName.endsWith('月')

    if (isChineseStyleMonth) {
      return `${monthName}${parsed.day}日`
    }

    return `${monthName} ${parsed.day}`
  }
}

/**
 * 创建月份格式化函数（支持 i18n）
 *
 * @param tMonths - 月份翻译函数，通常来自 useTranslations('months')
 * @returns 格式化月份的函数
 *
 * @example
 * ```tsx
 * const tMonths = useTranslations('months')
 * const formatMonth = createMonthFormatter(tMonths)
 * formatMonth('2024-01') // => "2024年1月" (zh) or "Jan 2024" (en)
 * ```
 */
export function createMonthFormatter(tMonths: Translator): (month: string | undefined) => string {
  return (month: string | undefined): string => {
    if (!month) {
      return DEFAULT_PLACEHOLDER
    }

    const parsed = parseMonthString(month)

    if (!parsed) {
      return DEFAULT_PLACEHOLDER
    }

    const monthName = getLocalizedMonthName(parsed.month, tMonths)
    const isChineseStyleMonth = monthName.endsWith('月')

    if (isChineseStyleMonth) {
      return `${parsed.year}年${monthName}`
    }

    return `${monthName} ${parsed.year}`
  }
}

/**
 * 创建日期范围格式化函数
 *
 * @param formatDate - 日期格式化函数
 * @returns 格式化日期范围的函数
 *
 * @example
 * ```tsx
 * const formatDateRange = createDateRangeFormatter(formatDate)
 * formatDateRange('2024-01-01', '2024-01-15') // => "Jan 1 - Jan 15"
 * formatDateRange('2024-01-01', '2024-01-01') // => "Jan 1"
 * ```
 */
export function createDateRangeFormatter(
  formatDate: (date: string | undefined) => string,
): (startDate: string | undefined, endDate: string | undefined) => string | undefined {
  return (startDate: string | undefined, endDate: string | undefined): string | undefined => {
    if (!startDate || !endDate) {
      return undefined
    }

    if (startDate === endDate) {
      return formatDate(startDate)
    }

    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }
}

/**
 * 创建完整的日期格式化器集合
 *
 * @param tMonths - 月份翻译函数
 * @returns 包含所有格式化函数的对象
 */
export function createDateFormatters(tMonths: Translator): DateFormatters {
  const formatDate = createDateFormatter(tMonths)
  const formatMonth = createMonthFormatter(tMonths)
  const formatDateRange = createDateRangeFormatter(formatDate)

  return {
    formatDate,
    formatMonth,
    formatDateRange,
  }
}
