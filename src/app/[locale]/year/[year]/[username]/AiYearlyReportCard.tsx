'use client'

import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  Maximize2Icon,
  RefreshCwIcon,
  SettingsIcon,
  SparklesIcon,
  SquareIcon,
  WandSparklesIcon,
} from 'lucide-react'

import { AiConfigDialog } from '~/components/AiConfig/AiConfigDialog'
import { ProseContainer } from '~/components/ProseContainer'
import { StatCard } from '~/components/StaticCard'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from '~/components/ui/empty'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip'
import { useAiConfig } from '~/hooks/useAiConfig'
import { useAiReportHistory } from '~/hooks/useAiReportHistory'
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard'
import { useMarkdownIt } from '~/hooks/useMarkdownIt'
import { useYearlyAiReportStream } from '~/hooks/useYearlyAiReportStream'
import { eventTracker } from '~/lib/analytics'
import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

interface AiYearlyReportCardProps {
  username: string
  year: number
  locale?: string
  tags: YearlyReportTags
  highlights?: YearlyReportHighlights
  /** 是否自动开始生成 */
  autoStart?: boolean
  /** 是否隐藏操作按钮 */
  hideActions?: boolean
}

const ACTION_BUTTON_SIZE = 'xs'
const ACTION_ICON_BUTTON_SIZE = 'icon-xs'
const ACTION_ICON_SIZE = 'size-3.5'

export function AiYearlyReportCard(props: AiYearlyReportCardProps) {
  const {
    username,
    year,
    locale,
    tags,
    highlights,
    autoStart = false,
    hideActions = false,
  } = props

  const t = useTranslations('aiReport')
  const tConfig = useTranslations('aiConfig')
  const { copied, copy } = useCopyToClipboard()

  const {
    config: aiConfig,
    isLoaded,
    reset: resetAiConfig,
    save: saveAiConfig,
    sourceInfo,
  } = useAiConfig()

  const {
    text,
    status,
    error,
    start,
    abort,
    reset,
  } = useYearlyAiReportStream({
    username,
    year,
    locale,
    tags,
    highlights,
    aiConfig,
  })

  const {
    currentVersion,
    currentIndex,
    history,
    hasHistory,
    isFirstVersion,
    isLastVersion,
    isGeneratingNew,
    goToPrevious,
    goToNext,
  } = useAiReportHistory({
    text,
    status,
    aiConfig,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAiConfigDialogOpen, setIsAiConfigDialogOpen] = useState(false)

  const isStreaming = status === 'streaming'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const displayText = isGeneratingNew ? text : (currentVersion.text || text)
  const hasText = displayText.length > 0

  useEffect(() => {
    if (autoStart && status === 'idle' && isLoaded) {
      void start()
    }
  }, [autoStart, status, start, isLoaded])

  const handleDialogOpenChange = useEvent((open: boolean) => {
    setIsDialogOpen(open)
  })

  const handleAiConfigDialogOpenChange = useEvent((open: boolean) => {
    setIsAiConfigDialogOpen(open)
  })

  const openAiConfigDialog = useEvent(() => {
    setIsAiConfigDialogOpen(true)
  })

  const handleCopy = useEvent(async () => {
    const textToCopy = displayText

    if (textToCopy) {
      await copy(textToCopy)
      eventTracker.ai.report.copy(year, textToCopy.length)
    }
  })

  const handleRegenerate = useEvent(() => {
    reset()
    void start()
  })

  const { html: markdownHtml } = useMarkdownIt(displayText)

  const renderContent = () => {
    if (isError && error) {
      const showBuiltinErrorHint = sourceInfo.source === 'builtin'

      return (
        <div className="flex flex-col gap-2">
          <Alert variant="error">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>

          {showBuiltinErrorHint && (
            <Alert variant="default">
              <AlertDescription className="flex flex-col gap-2">
                <span>{t('builtinErrorHint')}</span>
                <Button
                  className="w-fit"
                  size={ACTION_BUTTON_SIZE}
                  variant="outline"
                  onClick={openAiConfigDialog}
                >
                  <SettingsIcon className={ACTION_ICON_SIZE} />
                  {t('configureCustomAi')}
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )
    }

    if (hasText) {
      return (
        <div className="p-1 pt-0">
          <ProseContainer className="text-muted-foreground leading-relaxed prose-p:first-of-type:mt-0 prose-p:last-of-type:mb-0 prose-sm">
            <div dangerouslySetInnerHTML={{ __html: markdownHtml }} />
          </ProseContainer>
        </div>
      )
    }

    if (isStreaming) {
      return (
        <div className="flex flex-col gap-2 p-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[95%]" />
          <Skeleton className="h-4 w-[88%]" />
          <Skeleton className="h-4 w-[92%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      )
    }

    return (
      <div className="flex items-center justify-center h-full">
        <Empty className="border-0 p-4">
          <EmptyContent>
            <EmptyDescription>
              {t('description')}
            </EmptyDescription>

            <Button
              size="sm"
              onClick={() => {
                void start()
              }}
            >
              <WandSparklesIcon className="size-4" />
              {t('generate')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <StatCard
      cardClassName="h-full max-h-[360px]"
      cardContentClassName="overflow-hidden"
      icon={<SparklesIcon className="size-5" />}
      title={(
        <div className="flex items-center gap-2">
          <span>{t('title')}</span>

          {hasHistory && (
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <Button
                        aria-label={t('previousVersion')}
                        className="size-6"
                        disabled={isFirstVersion || isStreaming}
                        size={ACTION_ICON_BUTTON_SIZE}
                        variant="ghost"
                        onClick={goToPrevious}
                      >
                        <ChevronLeftIcon className={ACTION_ICON_SIZE} />
                      </Button>
                    )}
                  />
                  <TooltipContent>
                    {t('previousVersion')}
                  </TooltipContent>
                </Tooltip>

                <span className="tabular-nums inline-flex items-center select-none">
                  {currentIndex + 1}
                  <span className="mx-1">/</span>
                  {history.length}
                </span>

                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <Button
                        aria-label={t('nextVersion')}
                        className="size-6"
                        disabled={isLastVersion || isStreaming}
                        size={ACTION_ICON_BUTTON_SIZE}
                        variant="ghost"
                        onClick={goToNext}
                      >
                        <ChevronRightIcon className={ACTION_ICON_SIZE} />
                      </Button>
                    )}
                  />
                  <TooltipContent>
                    {t('nextVersion')}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          )}
        </div>
      )}
    >
      <AiConfigDialog
        config={aiConfig}
        open={isAiConfigDialogOpen}
        onOpenChange={handleAiConfigDialogOpenChange}
        onReset={resetAiConfig}
        onSave={saveAiConfig}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <div className="flex flex-col gap-grid-item h-full">
          {/* 内容区 */}
          <div className="relative flex-1 py-0 overflow-auto">
            <ScrollArea
              scrollFade
              className="p-grid-item"
            >
              <div
                key={currentVersion.id || 'current'}
                className="transition-opacity duration-200 ease-in-out"
              >
                {renderContent()}
              </div>
            </ScrollArea>
          </div>

          {/* 操作按钮 */}
          {!hideActions && (
            <div className="mt-auto flex flex-wrap items-center gap-2 p-grid-item-sm pt-0">
              {/* 生成中 - 取消按钮 */}
              {isStreaming && (
                <Button size={ACTION_BUTTON_SIZE} variant="outline" onClick={abort}>
                  <SquareIcon className={ACTION_ICON_SIZE} />
                  {t('cancel')}
                </Button>
              )}

              {/* 生成完成或失败 - 重新生成按钮 */}
              {(isSuccess || isError || (status === 'aborted' && hasText)) && (
                <Button size={ACTION_BUTTON_SIZE} variant="outline" onClick={handleRegenerate}>
                  <RefreshCwIcon className={ACTION_ICON_SIZE} />
                  {t('regenerate')}
                </Button>
              )}

              {/* 错误状态 - 重试按钮 */}
              {isError && (
                <Button size={ACTION_BUTTON_SIZE} onClick={() => void start()}>
                  {t('retry')}
                </Button>
              )}

              {/* 生成完成 - 复制按钮 */}
              {isSuccess && hasText && (
                <Button
                  size={ACTION_BUTTON_SIZE}
                  variant="outline"
                  onClick={() => void handleCopy()}
                >
                  {copied
                    ? (
                        <>
                          <CheckIcon className={ACTION_ICON_SIZE} />
                          {t('copied')}
                        </>
                      )
                    : (
                        <>
                          <CopyIcon className={ACTION_ICON_SIZE} />
                          {t('copy')}
                        </>
                      )}
                </Button>
              )}

              {isSuccess && hasText && (
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <DialogTrigger
                        render={(
                          <Button
                            size={ACTION_ICON_BUTTON_SIZE}
                            variant="ghost"
                          >
                            <Maximize2Icon className={ACTION_ICON_SIZE} />
                          </Button>
                        )}
                      />
                    )}
                  />
                  <TooltipContent>
                    {t('viewFull')}
                  </TooltipContent>
                </Tooltip>
              )}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  size={sourceInfo.source === 'custom'
                    ? ACTION_BUTTON_SIZE
                    : ACTION_ICON_BUTTON_SIZE}
                  variant="ghost"
                  onClick={openAiConfigDialog}
                >
                  <SettingsIcon className={ACTION_ICON_SIZE} />
                  {sourceInfo.source === 'custom' ? tConfig('configButton') : ''}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-3">
                <SparklesIcon className="shrink-0 size-5" />
                <span>
                  {t('title')}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <DialogPanel>
            <ProseContainer className="text-muted-foreground leading-relaxed prose-p:first-of-type:mt-0 prose-p:last-of-type:mb-0 prose-sm">
              <div dangerouslySetInnerHTML={{ __html: markdownHtml }} />
            </ProseContainer>
          </DialogPanel>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => void handleCopy()}
            >
              {copied
                ? (
                    <>
                      <CheckIcon />
                      {t('copied')}
                    </>
                  )
                : (
                    <>
                      <CopyIcon />
                      {t('copy')}
                    </>
                  )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StatCard>
  )
}
