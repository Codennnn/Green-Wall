import { memo, type RefObject, useMemo } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import { FileCheck2Icon, ImageIcon, ImagesIcon } from 'lucide-react'

import { AppearanceSetting } from '~/components/AppearanceSetting/AppearanceSetting'
import { DraggableAppearanceSetting } from '~/components/AppearanceSetting/DraggableAppearanceSetting'
import { SettingButton } from '~/components/SettingButton'
import { ShareButton } from '~/components/ShareButton'
import { useImageExport } from '~/hooks/useImageExport'
import type { SettingPopupPosition } from '~/hooks/useSettingPopup'
import { cn } from '~/lib/utils'

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
  const {
    canUseClipboardItem,
    isDownloading,
    isCopying,
    copySuccess,
    handleDownload,
    handleCopyImage,
  } = useImageExport(graphRef, username)

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
        <button
          className="inline-flex h-full items-center rounded-md bg-main-100 px-4 py-2 text-sm font-medium text-main-500 hover:bg-main-200 disabled:pointer-events-none motion-safe:transition-colors motion-safe:duration-300 md:text-base"
          disabled={isDownloading}
          onClick={handleDownloadClick}
        >
          <ImageIcon className="mr-2 size-4 shrink-0 md:size-5" />
          <span>{t('saveAsImage')}</span>
        </button>

        {canUseClipboardItem && (
          <button
            className={cn(
              'inline-flex h-full items-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none md:text-base',
              copySuccess
                ? 'bg-brand-100 text-brand-500'
                : 'bg-main-100 text-main-500 duration-300 hover:bg-main-200 motion-safe:transition-colors',
            )}
            disabled={isCopying}
            onClick={handleCopyClick}
          >
            <span className="mr-2">
              {copySuccess
                ? <FileCheck2Icon className="size-4 shrink-0 md:size-5" />
                : <ImagesIcon className="size-4 shrink-0 md:size-5" />}
            </span>
            <span>{copySuccess ? t('copiedAsImage') : t('copyAsImage')}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-6 md:justify-center">
        <ShareButton />

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
