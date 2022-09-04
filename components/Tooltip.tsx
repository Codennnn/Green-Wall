import {
  type Placement,
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react-dom-interactions'
import { cloneElement, useMemo, useState } from 'react'
import { mergeRefs } from 'react-merge-refs'

interface TooltipProps {
  children: JSX.Element
  label: React.ReactNode
  placement?: Placement
}

export default function Tooltip({ children, label, placement = 'top' }: TooltipProps) {
  const [open, setOpen] = useState(false)

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context),
    useFocus(context),
    useRole(context, { role: 'tooltip' }),
    useDismiss(context),
  ])

  const ref = useMemo(() => mergeRefs([reference, (children as any).ref]), [reference, children])

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref, ...children.props }))}
      {open && (
        <div
          {...getFloatingProps({
            ref: floating,
            style: {
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
            },
          })}
        >
          {label}
        </div>
      )}
    </>
  )
}
