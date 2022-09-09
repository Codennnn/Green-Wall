import * as RdxPopover from '@radix-ui/react-popover'

import { iconClose } from '../icons'

type PopoverProps = React.PropsWithChildren<
  RdxPopover.PopoverProps & {
    title?: string
    content?: React.ReactNode
  }
>

export default function Popover(props: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <RdxPopover.Root>
        <RdxPopover.Trigger asChild>{props.children}</RdxPopover.Trigger>

        <RdxPopover.Content
          align="center"
          className="
          radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down
          z-50 rounded-lg bg-white p-4 shadow-overlay
          "
          sideOffset={4}
        >
          <RdxPopover.Arrow className="fill-current text-white" />

          <h3 className="font-medium text-main-500">{props.title}</h3>

          <div>{props.content}</div>

          <RdxPopover.Close className="absolute top-3.5 right-3.5">
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <span className="h-4 w-4 text-main-500">{iconClose}</span>
            </span>
          </RdxPopover.Close>
        </RdxPopover.Content>
      </RdxPopover.Root>
    </div>
  )
}
