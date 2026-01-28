'use client'

import { useMemo } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { getCurrentYear } from '~/helpers'
import { cn } from '~/lib/utils'

const DEFAULT_START_YEAR = 2008

export interface YearSelectProps {
  /** 当前选中的年份（字符串格式） */
  value: string
  /** 年份变更回调 */
  onValueChange: (value: string | null) => void
  /** 禁用状态 */
  disabled?: boolean
  /** 年份范围起始年（包含），默认 2008 */
  startYear?: number
  /** 年份范围结束年（包含），默认当前年份 */
  endYear?: number
  /** 触发器自定义样式类名 */
  triggerClassName?: string
  /** 值显示自定义样式类名 */
  valueClassName?: string
  /** SelectContent 的 alignItemWithTrigger 属性 */
  alignItemWithTrigger?: boolean
}

export function YearSelect({
  value,
  onValueChange,
  disabled = false,
  startYear = DEFAULT_START_YEAR,
  endYear,
  triggerClassName,
  valueClassName,
  alignItemWithTrigger,
}: YearSelectProps) {
  const currentYear = getCurrentYear()
  const resolvedEndYear = endYear ?? currentYear

  const yearOptions = useMemo(() => {
    const years: number[] = []

    for (let year = resolvedEndYear; year >= startYear; year--) {
      years.push(year)
    }

    return years
  }, [resolvedEndYear, startYear])

  return (
    <Select
      disabled={disabled}
      value={value}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className={cn(
          'h-10 justify-center text-center',
          triggerClassName,
        )}
      >
        <SelectValue className={cn('font-medium', valueClassName)} />
      </SelectTrigger>

      <SelectContent alignItemWithTrigger={alignItemWithTrigger}>
        {yearOptions.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
