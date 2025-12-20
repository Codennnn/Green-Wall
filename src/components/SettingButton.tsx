import { useRef } from 'react'

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
import { eventTracker } from '~/lib/analytics'

interface SettingButtonProps extends Omit<React.ComponentProps<'button'>, 'content'> {
  content?: React.ReactNode
  popoverContentId?: string
  onPopOut?: () => void
}

export function SettingButton(props: SettingButtonProps) {
  const { content, popoverContentId, onPopOut, ...buttonProps } = props

  const t = useTranslations('settings')
  const tCommon = useTranslations('common')

  const popoutTriggeredRef = useRef(false)

  return (
    <Popover
      onOpenChange={(open) => {
        if (open) {
          eventTracker.ui.settings.open('button')
        }
        else if (!popoutTriggeredRef.current) {
          eventTracker.ui.settings.close('button')
        }

        if (!open) {
          popoutTriggeredRef.current = false
        }
      }}
    >
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
                render={(
                  <Button size="icon-sm" type="button" variant="ghost">
                    <PictureInPicture2Icon />
                  </Button>
                )}
                title={t('popOut')}
                onClick={() => {
                  popoutTriggeredRef.current = true
                  eventTracker.ui.settings.popout()
                  eventTracker.ui.settings.close('popout')
                  onPopOut?.()
                }}
              />
            </div>
          </PopoverTitle>

          <PopoverClose
            className="ml-auto"
            render={(
              <Button size="icon-sm" type="button" variant="ghost">
                <XIcon />
              </Button>
            )}
            title={tCommon('close')}
          />
        </div>

        <div className="pt-2">
          {content}
        </div>
      </PopoverContent>
    </Popover>
  )
}
