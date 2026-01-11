import { LoaderIcon } from 'lucide-react'

import { cn } from '~/lib/utils'

export function SpinningLoader() {
  return (
    <LoaderIcon
      className="size-4 animate-spin text-muted-foreground"
    />
  )
}

export interface StaticCardTitleProps {
  children: React.ReactNode
  icon: React.ReactNode
}

export function StaticCardTitle(props: StaticCardTitleProps) {
  const { icon, children } = props

  return (
    <span className="flex-1 flex items-center gap-x-3">
      {icon}
      <span className="font-medium w-full">{children}</span>
    </span>
  )
}

export interface StaticCardProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function StaticCard(props: StaticCardProps) {
  const {
    children,
    className,
    contentClassName,
  } = props

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
                'flex flex-col h-full bg-linear-to-b from-foreground/4 to-background',
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
  /** 数值单位，显示在数值后面 */
  unit?: string
}

export function StatValue(props: StatValueProps) {
  const { value, subValue, isLoading, fallback = 0, large, unit } = props

  const finalValue = value ?? fallback

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
                    'leading-none font-bold',
                    large && 'md:text-3xl',
                  )}
                >
                  {finalValue}
                  {unit && (
                    <span className="ml-1 text-foreground/70 text-sm font-normal">
                      {unit}
                    </span>
                  )}
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
  title?: React.ReactNode
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  /** 外层容器的 className */
  wrapperClassName?: string
  /** 内容区的 className */
  contentClassName?: string
  /** 卡片的 className */
  cardClassName?: string
  /** 卡片内容的 className */
  cardContentClassName?: string
  /** StatValue 组件的属性配置 */
  statValueProps?: {
    value?: number | string
    subValue?: number | string
    isLoading?: boolean
    fallback?: number | string
    /** 是否启用大尺寸展示样式（用于跨行卡片） */
    large?: boolean
    /** 数值单位，显示在数值后面 */
    unit?: string
  }
}

export function StatCard(props: React.PropsWithChildren<StatCardProps>) {
  const {
    children,
    icon,
    title,
    onMouseEnter,
    onMouseLeave,
    wrapperClassName,
    contentClassName,
    cardClassName,
    cardContentClassName,
    statValueProps,
  } = props

  return (
    <div
      className={cn('h-full', wrapperClassName)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StaticCard
        className={cardClassName}
        contentClassName={contentClassName}
      >
        <div className="flex items-center gap-grid-item p-grid-item">
          {(!!icon || !!title) && (
            <StaticCardTitle icon={icon}>
              {title}
            </StaticCardTitle>
          )}

          {!!statValueProps && (
            <StatValue
              fallback={statValueProps.fallback}
              isLoading={statValueProps.isLoading ?? true}
              large={statValueProps.large}
              subValue={statValueProps.subValue}
              unit={statValueProps.unit}
              value={statValueProps.value}
            />
          )}
        </div>

        <div className={cn('flex-1', cardContentClassName)}>
          {children}
        </div>
      </StaticCard>
    </div>
  )
}
