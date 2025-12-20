import { memo, type RefObject, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import { FileCheck2Icon, ImageIcon, ImagesIcon } from 'lucide-react'

import { AppearanceSetting } from '~/components/AppearanceSetting/AppearanceSetting'
import { DraggableAppearanceSetting } from '~/components/AppearanceSetting/DraggableAppearanceSetting'
import { SettingButton } from '~/components/SettingButton'
import { ShareButton } from '~/components/ShareButton'
import { Button } from '~/components/ui/button'
import { Separator } from '~/components/ui/separator'
import { useData } from '~/DataContext'
import { useImageExport } from '~/hooks/useImageExport'
import type { SettingPopupPosition } from '~/hooks/useSettingPopup'

interface GraphActionBarProps {
  graphRef: RefObject<HTMLDivElement | null>
  username: string
  settingPopoverContentId: string
  settingPopupPosition: SettingPopupPosition | undefined
  onSettingClick: () => void
  onSettingPopOut: () => void
  onSettingPopupClose: () => void
}

export const GraphActionBar = memo(function GraphActionBar({
  graphRef,
  username,
  settingPopoverContentId,
  settingPopupPosition,
  onSettingClick,
  onSettingPopOut,
  onSettingPopupClose,
}: GraphActionBarProps) {
  const t = useTranslations('graph')
  const { settings } = useData()
  const {
    canUseClipboardItem,
    isDownloading,
    isCopying,
    copySuccess,
    handleDownload,
    handleCopyImage,
  } = useImageExport(graphRef, username, settings)

  const handleDownloadClick = useEvent(() => {
    void handleDownload()
  })

  const handleCopyClick = useEvent(() => {
    void handleCopyImage()
  })

  const appearanceSettingContent = useMemo(() => <AppearanceSetting />, [])

  const draggableInitialPosition = useMemo(() => ({
    x: settingPopupPosition?.offsetX ?? 0,
    y: settingPopupPosition?.offsetY ?? 0,
  }), [settingPopupPosition?.offsetX, settingPopupPosition?.offsetY])

  return (
    <>
      <div className="flex gap-x-3">
        <Button
          disabled={isDownloading}
          variant="outline"
          onClick={handleDownloadClick}
        >
          <ImageIcon />
          <span>{t('saveAsImage')}</span>
        </Button>

        {canUseClipboardItem && (
          <Button
            disabled={isCopying}
            variant="outline"
            onClick={handleCopyClick}
          >
            <span>
              {
                copySuccess
                  ? <FileCheck2Icon />
                  : <ImagesIcon />
              }
            </span>
            <span>{copySuccess ? t('copiedAsImage') : t('copyAsImage')}</span>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-2 md:justify-center">
        <ShareButton />

        <Separator className="h-4.5" orientation="vertical" />

        <SettingButton
          content={appearanceSettingContent}
          popoverContentId={settingPopoverContentId}
          onClick={onSettingClick}
          onPopOut={onSettingPopOut}
        />

        <div className="relative">
          {!!settingPopupPosition && (
            <DraggableAppearanceSetting
              initialPosition={draggableInitialPosition}
              onClose={onSettingPopupClose}
            >
              {appearanceSettingContent}
            </DraggableAppearanceSetting>
          )}
        </div>
      </div>
    </>
  )
})
