import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import {
  createDateFormatter,
  createDateFormatters,
  createDateRangeFormatter,
  createMonthFormatter,
  type DateFormatters,
} from '~/lib/date-format-i18n'

/**
 * 获取支持 i18n 的日期格式化函数集合
 *
 * 该 hook 基于当前 locale 提供本地化的日期格式化能力。
 * 内部使用 next-intl 的翻译系统，确保与项目其他部分的 i18n 实现一致。
 *
 * @returns 包含格式化函数的对象
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { formatDate, formatMonth, formatDateRange } = useDateFormatters()
 *
 *   return (
 *     <div>
 *       <p>日期: {formatDate('2024-01-15')}</p>
 *       <p>月份: {formatMonth('2024-01')}</p>
 *       <p>范围: {formatDateRange('2024-01-01', '2024-01-15')}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useDateFormatters(): DateFormatters {
  const tMonths = useTranslations('months')

  return useMemo(() => createDateFormatters(tMonths), [tMonths])
}

/**
 * 获取单独的日期格式化函数
 *
 * @returns 日期格式化函数
 *
 * @example
 * ```tsx
 * const formatDate = useDateFormatter()
 * formatDate('2024-01-15') // => "Jan 15" or "1月 15"
 * ```
 */
export function useDateFormatter(): (date: string | undefined) => string {
  const tMonths = useTranslations('months')

  return useMemo(() => createDateFormatter(tMonths), [tMonths])
}

/**
 * 获取单独的月份格式化函数
 *
 * @returns 月份格式化函数
 *
 * @example
 * ```tsx
 * const formatMonth = useMonthFormatter()
 * formatMonth('2024-01') // => "Jan 2024" or "2024年1月"
 * ```
 */
export function useMonthFormatter(): (month: string | undefined) => string {
  const tMonths = useTranslations('months')

  return useMemo(() => createMonthFormatter(tMonths), [tMonths])
}

/**
 * 获取日期范围格式化函数
 *
 * @returns 日期范围格式化函数
 *
 * @example
 * ```tsx
 * const formatDateRange = useDateRangeFormatter()
 * formatDateRange('2024-01-01', '2024-01-15') // => "Jan 1 - Jan 15"
 * ```
 */
export function useDateRangeFormatter(): (
  startDate: string | undefined,
  endDate: string | undefined,
) => string | undefined {
  const tMonths = useTranslations('months')

  return useMemo(() => {
    const formatDate = createDateFormatter(tMonths)

    return createDateRangeFormatter(formatDate)
  }, [tMonths])
}
