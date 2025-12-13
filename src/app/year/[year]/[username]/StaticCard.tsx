import { LoaderIcon } from 'lucide-react'

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
}

export function StaticCard(props: StaticCardProps) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-solid border-main-200 ">
      <div className="rounded-[11px] border border-background">
        <div className="rounded-[10px] border border-main-300">
          <div className="overflow-hidden rounded-[9px] border border-white/50">
            <div className="flex items-center gap-x-6 gap-y-2 bg-linear-to-b from-main-100/80 to-main-100/5 px-3 py-1 min-h-12">
              {props.children}
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
}

export function StatValue(props: StatValueProps) {
  const { value, subValue, isLoading, fallback = 0 } = props

  return (
    <div className="ml-auto tabular-nums">
      {
        isLoading
          ? <SpinningLoader />
          : (
              <div className="flex flex-col items-end gap-1">
                <span className="leading-none">{value ?? fallback}</span>
                {!!subValue && <span className="text-muted-foreground text-xs leading-none">{subValue}</span>}
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
  } = props

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <StaticCard>
        <StaticCardTitle icon={icon}>
          {title}
        </StaticCardTitle>

        <StatValue
          fallback={fallback}
          isLoading={isLoading}
          subValue={subValue}
          value={value}
        />
      </StaticCard>
    </div>
  )
}
