import * as Popover from '@radix-ui/react-popover'

import { iconPopOut, iconSetting } from './icons'
import { RadixPopover } from './ui-kit/RadixPopover'

interface SettingButtonProps extends React.ComponentProps<'button'> {
  content: React.ReactNode
  onPopOut?: () => void
}

export default function SettingButton(props: SettingButtonProps) {
  const { content, onPopOut, ...buttonProps } = props

  return (
    <RadixPopover
      content={content}
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
