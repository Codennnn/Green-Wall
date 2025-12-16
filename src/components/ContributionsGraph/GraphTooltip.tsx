'use client'

import { useEffect, useState } from 'react'

import {
  autoUpdate,
  flip,
  offset,
  type Placement,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'

import { cn } from '~/lib/utils'

interface TooltipProps extends Pick<React.ComponentProps<'span'>, 'className'> {
  label?: React.ReactNode
  placement?: Placement
  refElement?: Element | null
}

export function GraphTooltip({
  label,
  placement = 'top',
  className,
  refElement,
}: TooltipProps) {
  const [open, setOpen] = useState(false)

  const { x, y, refs, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange: (isOpen) => {
      setOpen(isOpen)
    },
    middleware: [offset(4), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getFloatingProps } = useInteractions([
    useHover(context),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
    useDismiss(context),
  ])

  useEffect(() => {
    refs.setReference(refElement ?? null)
  }, [refs, refElement])

  return (
    <>
      {open && (
        <span
          {...getFloatingProps({
            ref: refs.setFloating,
            style: {
              position: strategy,
              top: y,
              left: x,
            },
          })}
          className={cn(
            'z-20 whitespace-nowrap rounded border border-solid border-(--theme-border) bg-(--theme-background) px-2 text-(--theme-foreground)',
            className,
          )}
        >
          {label}
        </span>
      )}
    </>
  )
}
