import * as Popover from '@radix-ui/react-popover'

import { iconClose } from '../icons'

type PopoverProps = Popover.PopoverProps & {
  title?: string
  content?: React.ReactNode
}

export function RadixPopover(props: React.PropsWithChildren<PopoverProps>) {
  const { children, title, content, ...popoverProps } = props

  return (
    <div className="relative inline-block text-left">
      <Popover.Root {...popoverProps}>
        <Popover.Trigger asChild>{children}</Popover.Trigger>

        <Popover.Content
          align="center"
          className="
          radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down
          z-50 rounded-lg bg-white p-4 shadow-overlay
          "
          sideOffset={4}
        >
          <Popover.Arrow className="fill-current text-white" />

          <div className="mb-2">
            <h3 className="min-h-[24px] font-medium text-main-500">{title}</h3>
            <Popover.Close aria-label="Close" className="absolute top-3.5 right-3.5" title="Close">
              <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
                <span className="h-4 w-4 text-main-500">{iconClose}</span>
              </span>
            </Popover.Close>
          </div>

          {content}
        </Popover.Content>
      </Popover.Root>
    </div>
  )
}
