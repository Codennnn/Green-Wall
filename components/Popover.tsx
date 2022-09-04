import type { Placement } from '@floating-ui/react-dom-interactions'
import {
  autoUpdate,
  flip,
  FloatingFocusManager,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react-dom-interactions'
import { cloneElement, useId, useState } from 'react'

interface PopoverProps {
  children: JSX.Element
  content: React.ReactNode
  placement?: Placement
  offset?: Parameters<typeof offset>[0]
}

export default function Popover({
  children,
  content,
  placement,
  offset: offsetValue = 0,
}: PopoverProps) {
  const [open, setOpen] = useState(false)

  const { x, y, reference, floating, strategy, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(offsetValue), flip(), shift()],
    placement,
    whileElementsMounted: autoUpdate,
  })

  const id = useId()
  const labelId = `${id}-label`
  const descriptionId = `${id}-description`

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    useDismiss(context),
  ])

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: reference, ...children.props }))}
      {open && (
        <FloatingFocusManager
          context={context}
          modal={false}
          order={['reference', 'content']}
          returnFocus={false}
        >
          <div
            {...getFloatingProps({
              ref: floating,
              style: {
                position: strategy,
                top: y ?? 0,
                left: x ?? 0,
                zIndex: 99,
              },
              'aria-labelledby': labelId,
              'aria-describedby': descriptionId,
            })}
          >
            {content}
          </div>
        </FloatingFocusManager>
      )}
    </>
  )
}
