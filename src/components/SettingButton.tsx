import { useTranslations } from 'next-intl'
import { PictureInPicture2Icon, Settings2Icon, XIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
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
      <PopoverTrigger
        render={(
          <Button variant="ghost" {...buttonProps}>
            <Settings2Icon />
            <span>{t('appearance')}</span>
          </Button>
        )}
      />

      <PopoverContent id={popoverContentId}>
        <div className="mb-2 flex items-center">
          <PopoverTitle className="flex-1">
            <div className="flex">
              <span>{t('appearance')}</span>

              <PopoverClose
                className="ml-auto hidden md:block"
                title={t('popOut')}
                onClick={() => {
                  onPopOut?.()
                }}
              >
                <Button size="icon-sm" type="button" variant="ghost">
                  <PictureInPicture2Icon />
                </Button>
              </PopoverClose>
            </div>
          </PopoverTitle>

          <PopoverClose className="ml-auto" title={tCommon('close')}>
            <Button size="icon-sm" type="button" variant="ghost">
              <XIcon />
            </Button>
          </PopoverClose>
        </div>
        {content}
      </PopoverContent>
    </Popover>
  )
}
