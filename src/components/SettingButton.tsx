import { useTranslations } from 'next-intl'
import { PictureInPicture2Icon, Settings2Icon, XIcon } from 'lucide-react'

import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover'

interface SettingButtonProps extends Omit<React.ComponentProps<'button'>, 'content'> {
  content?: React.ReactNode
  popoverContentId?: string
  onPopOut?: () => void
}

export function SettingButton(props: SettingButtonProps) {
  const { content, popoverContentId, onPopOut, ...buttonProps } = props
  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  return (
    <Popover>
      <PopoverTrigger className="simple-button" {...buttonProps}>
        <Settings2Icon className="size-[18px]" />
        <span>{t('appearance')}</span>
      </PopoverTrigger>
      <PopoverContent id={popoverContentId}>
        <div className="mb-2 flex items-center">
          <PopoverTitle className="min-h-[24px] flex-1 font-medium text-main-500">
            <div className="flex">
              <span>{t('appearance')}</span>

              <PopoverClose
                className="ml-auto hidden md:block"
                title={t('popOut')}
                onClick={() => {
                  onPopOut?.()
                }}
              >
                <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
                  <PictureInPicture2Icon className="size-4 text-main-500" />
                </span>
              </PopoverClose>
            </div>
          </PopoverTitle>
          <PopoverClose className="ml-auto" title={tCommon('close')}>
            <span className="inline-flex items-center justify-center rounded p-[0.3rem] transition-colors duration-200 hover:bg-main-100/80">
              <XIcon className="size-4 text-main-500" />
            </span>
          </PopoverClose>
        </div>
        {content}
      </PopoverContent>
    </Popover>
  )
}
