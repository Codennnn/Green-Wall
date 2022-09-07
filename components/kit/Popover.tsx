import * as PopoverPrimitive from '@radix-ui/react-popover'

import { iconClose } from '../icons'

type PopoverProps = React.PropsWithChildren<
  PopoverPrimitive.PopoverProps & {
    title?: string
    content?: React.ReactNode
  }
>

export default function Popover(props: PopoverProps) {
  return (
    <div className="relative inline-block text-left">
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>{props.children}</PopoverPrimitive.Trigger>

        <PopoverPrimitive.Content
          align="center"
          className="
          radix-side-top:animate-slide-up radix-side-bottom:animate-slide-down
          z-50 rounded-lg bg-white p-4 shadow-overlay
          "
          sideOffset={4}
        >
          <PopoverPrimitive.Arrow className="fill-current text-white" />

          <h3 className="font-medium text-main-500">{props.title}</h3>

          <div>{props.content}</div>

          <PopoverPrimitive.Close className="absolute top-3.5 right-3.5">
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <span className="h-4 w-4 text-main-500">{iconClose}</span>
            </span>
          </PopoverPrimitive.Close>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Root>
    </div>
  )
}
