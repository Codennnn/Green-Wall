import * as Popover from '@radix-ui/react-popover'

import { type PopoverProps, RadixPopover } from './ui-kit/RadixPopover'
import { iconPopOut, iconSetting } from './icons'

interface SettingButtonProps
  extends Omit<React.ComponentProps<'button'>, 'content'>,
    Pick<PopoverProps, 'content' | 'popoverContentId'> {
  onPopOut?: () => void
}

export function SettingButton(props: SettingButtonProps) {
  const { content, popoverContentId, onPopOut, ...buttonProps } = props

  return (
    <RadixPopover
      content={content}
      popoverContentId={popoverContentId}
      title={
        <div className="flex">
          <span>Appearance</span>
          <Popover.Close
            aria-label="Pop Out"
            className="ml-auto hidden md:block"
            title="Pop Out"
            onClick={() => {
              onPopOut?.()
            }}
          >
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <span className="h-4 w-4 text-main-500">{iconPopOut}</span>
            </span>
          </Popover.Close>
        </div>
      }
    >
      <button className="simple-button" {...buttonProps}>
        <span className="h-5 w-5">{iconSetting}</span>
        <span>Appearance</span>
      </button>
    </RadixPopover>
  )
}
