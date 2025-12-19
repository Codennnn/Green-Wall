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
