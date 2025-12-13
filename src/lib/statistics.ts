import { getValuableStatistics } from '~/helpers'
import type { GraphData, ValuableStatistics } from '~/types'

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
 * 格式化日期为更友好的显示格式
 * @param date - YYYY-MM-DD 格式的日期字符串
 * @returns 格式化后的日期字符串，如 "Jan 15"
 */
export function formatStatDate(date: string | undefined): string {
  let formatted = '-'

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
 * 格式化月份为更友好的显示格式
 * @param month - YYYY-MM 格式的月份字符串
 * @returns 格式化后的月份字符串，如 "Jan 2024"
 */
export function formatStatMonth(month: string | undefined): string {
  let formatted = '-'

  if (month) {
    const match = /^(\d{4})-(\d{2})$/.exec(month)

    if (match) {
      const year = Number(match[1])
      const monthNumber = Number(match[2])

      if (monthNumber >= 1 && monthNumber <= 12) {
        // 同 formatStatDate：使用 UTC 让“月份标识符”展示不受本地时区影响。
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
