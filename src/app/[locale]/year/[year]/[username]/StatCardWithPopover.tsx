import { Empty, EmptyDescription } from '~/components/ui/empty'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { cn } from '~/lib/utils'

export interface StatCardWithPopoverProps<T extends { url: string }> {
  children: React.ReactNode
  ariaLabel: string
  popoverTitle: string
  popoverCount: number | undefined
  isLoading: boolean
  error: Error | null | undefined
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyMessage: string
  errorMessage: string
  side?: 'left' | 'right' | 'top' | 'bottom'
  align?: 'start' | 'center' | 'end'
  contentClassName?: string
  /** 外层容器的 className，用于网格布局定位 */
  className?: string
}

export function StatCardWithPopover<T extends { url: string }>(props: StatCardWithPopoverProps<T>) {
  const {
    children,
    ariaLabel,
    popoverTitle,
    popoverCount,
    isLoading,
    error,
    items,
    renderItem,
    emptyMessage,
    errorMessage,
    side = 'left',
    align = 'start',
    contentClassName = 'w-[min(90vw,420px)]',
    className,
  } = props

  return (
    <div className={className}>
      <Popover>
        <PopoverTrigger
          openOnHover
          render={(
            <button
              aria-label={ariaLabel}
              className="block h-full w-full cursor-pointer appearance-none border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              type="button"
            />
          )}
        >
          {children}
        </PopoverTrigger>

        <PopoverContent
          align={align}
          className={cn('**:data-[slot=popover-viewport]:p-0', contentClassName)}
          side={side}
        >
          <div className="flex items-center gap-2 p-grid-item">
            <span className="font-medium">
              {popoverTitle}
            </span>
            {typeof popoverCount === 'number' && popoverCount > 0 && (
              <span className="ml-auto text-foreground/70 text-xs tabular-nums">
                {popoverCount}
              </span>
            )}
          </div>

          <ScrollArea
            scrollFade
            className="h-72"
          >
            <div className="p-grid-item">
              {isLoading
                ? (
                    <div className="flex flex-col gap-1">
                      {Array.from({ length: 4 }).map((_, index) => {
                        return (
                          <div
                            key={index}
                            className="rounded-md px-2 py-2"
                          >
                            <Skeleton className="mb-2 h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                          </div>
                        )
                      })}
                    </div>
                  )
                : error || items.length === 0
                  ? (
                      <Empty>
                        <EmptyDescription
                          className={error ? 'text-destructive' : 'text-muted-foreground'}
                        >
                          {
                            error
                              ? errorMessage
                              : emptyMessage
                          }
                        </EmptyDescription>
                      </Empty>
                    )
                  : (
                      <ul className="flex flex-col gap-1">
                        {items.map((item) => {
                          return (
                            <li key={item.url}>
                              {renderItem(item)}
                            </li>
                          )
                        })}
                      </ul>
                    )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  )
}
