import { getValuableStatistics } from '~/helpers'
import type { GraphData, ValuableStatistics } from '~/types'

export type { DateFormatters, Translator } from './date-format-i18n'
export {
  createDateFormatter,
  createDateFormatters,
  createDateRangeFormatter,
  createMonthFormatter,
} from './date-format-i18n'

/**
 * 获取或计算统计数据
 * @param graphData - 贡献图数据
 * @returns 统计数据，如果 graphData 为空则返回 undefined
 */
export function deriveStatistics(
  graphData: GraphData | undefined,
): ValuableStatistics | undefined {
  if (!graphData) {
    return undefined
  }

  // 优先使用 API 预计算的统计数据
  if (graphData.statistics) {
    return graphData.statistics
  }

  // Fallback: 前端计算
  return getValuableStatistics(graphData)
}

/**
 * 格式化数字统计值
 * @param value - 数字值
 * @param fallback - 默认值
 * @returns 格式化后的字符串
 */
export function formatStatNumber(
  value: number | undefined,
  fallback: number | string = 0,
): number | string {
  return value ?? fallback
}

// ============================================================================
// 向后兼容的日期格式化函数（默认使用英文 locale）
// ============================================================================
// 注意：这些函数仅用于向后兼容或非 React 环境。
// 在 React 组件中，推荐使用 useDateFormatters hook 以获得正确的 i18n 支持。

const DEFAULT_PLACEHOLDER = '-'

/**
 * 格式化日期为更友好的显示格式（默认英文）
 *
 * @param date - YYYY-MM-DD 格式的日期字符串
 * @returns 格式化后的日期字符串，如 "Jan 15"
 *
 * @deprecated 推荐在 React 组件中使用 useDateFormatters hook
 * @example
 * ```tsx
 * // 推荐方式：
 * import { useDateFormatters } from '~/hooks/useDateFormatters'
 * const { formatDate } = useDateFormatters()
 *
 * // 向后兼容方式（仅用于非 React 环境）：
 * import { formatStatDate } from '~/lib/statistics'
 * formatStatDate('2024-01-15') // => "Jan 15"
 * ```
 */
export function formatStatDate(date: string | undefined): string {
  let formatted = DEFAULT_PLACEHOLDER

  if (date) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)

    if (match) {
      const year = Number(match[1])
      const month = Number(match[2])
      const day = Number(match[3])

      const utcDate = new Date(Date.UTC(year, month - 1, day))

      const isValidDate
        = utcDate.getUTCFullYear() === year
          && utcDate.getUTCMonth() === month - 1
          && utcDate.getUTCDate() === day

      if (isValidDate) {
        const monthName = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }).format(utcDate)

        formatted = `${monthName} ${day}`
      }
    }
  }

  return formatted
}

/**
 * 格式化月份为更友好的显示格式（默认英文）
 *
 * @param month - YYYY-MM 格式的月份字符串
 * @returns 格式化后的月份字符串，如 "Jan 2024"
 *
 * @deprecated 推荐在 React 组件中使用 useDateFormatters hook
 * @example
 * ```tsx
 * // 推荐方式：
 * import { useDateFormatters } from '~/hooks/useDateFormatters'
 * const { formatMonth } = useDateFormatters()
 *
 * // 向后兼容方式（仅用于非 React 环境）：
 * import { formatStatMonth } from '~/lib/statistics'
 * formatStatMonth('2024-01') // => "Jan 2024"
 * ```
 */
export function formatStatMonth(month: string | undefined): string {
  let formatted = DEFAULT_PLACEHOLDER

  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month)

    if (match) {
      const year = Number(match[1])
      const monthNumber = Number(match[2])

      if (monthNumber >= 1 && monthNumber <= 12) {
        const utcDate = new Date(Date.UTC(year, monthNumber - 1, 1))

        const monthName = new Intl.DateTimeFormat('en-US', {
          month: 'short',
          timeZone: 'UTC',
        }).format(utcDate)

        formatted = `${monthName} ${year}`
      }
    }
  }

  return formatted
}
