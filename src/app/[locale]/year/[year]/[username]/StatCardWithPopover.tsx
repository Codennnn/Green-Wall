import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover'

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
  loadingMessage: string
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
    loadingMessage,
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
          className={contentClassName}
          side={side}
        >
          <div className="flex items-center gap-2 pb-3">
            <span className="font-medium">
              {popoverTitle}
            </span>
            <span className="ml-auto text-foreground/70 text-xs tabular-nums">
              {popoverCount ?? 0}
            </span>
          </div>

          {isLoading
            ? (
                <div className="flex items-center gap-2 text-foreground/70 text-sm">
                  <div className="size-4 animate-spin rounded-full border-2 border-border border-t-transparent" />
                  <span>{loadingMessage}</span>
                </div>
              )
            : error
              ? (
                  <div className="text-destructive text-sm">
                    {errorMessage}
                  </div>
                )
              : (
                  <div className="flex flex-col gap-1">
                    {items.length === 0
                      ? (
                          <div className="text-foreground/70 text-sm">
                            {emptyMessage}
                          </div>
                        )
                      : (
                          <div className="max-h-72 overflow-y-auto pr-1">
                            <ul className="flex flex-col gap-1">
                              {items.map((item) => {
                                return (
                                  <li key={item.url}>
                                    {renderItem(item)}
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                        )}
                  </div>
                )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
