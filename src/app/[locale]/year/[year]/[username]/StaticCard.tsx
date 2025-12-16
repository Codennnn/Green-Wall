import { LoaderIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

export function SpinningLoader() {
  return <LoaderIcon className="size-4 animate-spin text-main-300" />
}

export interface StaticCardTitleProps {
  children: React.ReactNode
  icon: React.ReactNode
}

export function StaticCardTitle(props: StaticCardTitleProps) {
  const { icon, children } = props

  return (
    <span className="flex items-center gap-x-3">
      {icon}
      <span className="font-medium">{children}</span>
    </span>
  )
}

export interface StaticCardProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function StaticCard(props: StaticCardProps) {
  const { children, className, contentClassName } = props

  return (
    <div
      className={cn(
        'overflow-hidden rounded-[12px] border border-foreground/13',
        className,
      )}
    >
      <div className="h-full rounded-[11px] border border-background">
        <div className="h-full rounded-[10px] border border-foreground/20">
          <div className="h-full overflow-hidden rounded-[9px] border border-background/50">
            <div
              className={cn(
                'flex h-full min-h-12 items-center gap-x-6 gap-y-2 bg-linear-to-b from-foreground/4 to-background p-grid-item',
                contentClassName,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export interface StatValueProps {
  value: number | string | undefined
  subValue?: number | string | undefined
  isLoading: boolean
  fallback?: number | string
  /** 是否启用大尺寸展示样式（用于跨行卡片） */
  large?: boolean
}

export function StatValue(props: StatValueProps) {
  const { value, subValue, isLoading, fallback = 0, large } = props

  return (
    <div className={cn('tabular-nums', large ? 'ml-auto md:ml-0 md:w-full' : 'ml-auto')}>
      {
        isLoading
          ? <SpinningLoader />
          : (
              <div
                className={cn(
                  'flex flex-col gap-1',
                  large ? 'items-end md:items-start' : 'items-end',
                )}
              >
                <span
                  className={cn(
                    'leading-none',
                    large && 'md:text-3xl md:font-semibold',
                  )}
                >
                  {value ?? fallback}
                </span>
                {!!subValue && (
                  <span
                    className={cn(
                      'text-foreground/70 leading-none',
                      large ? 'text-xs md:text-sm' : 'text-xs',
                    )}
                  >
                    {subValue}
                  </span>
                )}
              </div>
            )
      }
    </div>
  )
}

export interface StatCardProps {
  icon: React.ReactNode
  title: React.ReactNode
  value: number | string | undefined
  subValue?: number | string | undefined
  isLoading: boolean
  fallback?: number | string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  /** 外层容器的 className，用于网格布局定位 */
  className?: string
  /** 卡片内容的 className，用于跨行时的内容布局调整 */
  contentClassName?: string
  /** 是否启用大尺寸展示样式（用于跨行卡片） */
  large?: boolean
}

export function StatCard(props: StatCardProps) {
  const {
    icon,
    title,
    value,
    subValue,
    isLoading,
    fallback,
    onMouseEnter,
    onMouseLeave,
    className,
    contentClassName,
    large,
  } = props

  return (
    <div
      className={cn('h-full', className)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StaticCard className="h-full" contentClassName={contentClassName}>
        <StaticCardTitle icon={icon}>
          {title}
        </StaticCardTitle>

        <StatValue
          fallback={fallback}
          isLoading={isLoading}
          large={large}
          subValue={subValue}
          value={value}
        />
      </StaticCard>
    </div>
  )
}
