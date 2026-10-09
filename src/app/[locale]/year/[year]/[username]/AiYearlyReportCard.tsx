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
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
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
import { isConfigErrorCode } from '~/lib/ai/stream-error'
import { eventTracker } from '~/lib/analytics'
import type { AiRuntimeConfig } from '~/types/ai-config'
import type {
  AiReportError,
  AiStreamErrorCode,
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
  /** 依赖的年度数据是否已就绪，未就绪时不允许生成，避免用兜底标签生成出错误结论 */
  isDataReady?: boolean
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
    isDataReady = true,
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
    storageScope: `${username}-${year}`,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAiConfigDialogOpen, setIsAiConfigDialogOpen] = useState(false)

  const isStreaming = status === 'streaming'
  const isError = status === 'error'
  const displayText = isGeneratingNew ? text : (currentVersion.text || text)
  const hasText = displayText.length > 0
  const isBuiltinSource = sourceInfo.source === 'builtin'

  /** 内容区是否展示了可阅读的正文（成功内容，或失败、取消后保留的内容） */
  const hasReadableContent = hasText && !isStreaming

  /** 数据未就绪时禁止发起生成，避免用兜底标签得到错误结论 */
  const canGenerate = isDataReady

  /**
   * 失败时只保留一个主操作，避免「重试」与「重新生成」重复：
   * - 可重试的错误 → 重试
   * - 配置类错误（密钥、模型等，重试无法解决）→ 把配置入口变成明确的引导按钮
   *   内置 AI 服务已在内容区给出同样的引导，这里只处理自定义配置的情况
   * - 其余不可重试的错误（配额用尽、内容过滤等）→ 兜底给一个重新生成入口，
   *   否则动作区会一个按钮都没有，用户只能刷新页面；
   *   内置服务不兜底，它的出口已经在内容区的提示里了
   */
  const showRetryAction = isError && error?.retryable === true
  const showConfigAction = isError
    && error?.retryable === false
    && !isBuiltinSource
    && isConfigErrorCode(error.code)
  const showErrorFallbackAction = isError
    && !showRetryAction
    && !showConfigAction
    && !isBuiltinSource

  useEffect(() => {
    if (autoStart && status === 'idle' && isLoaded && isDataReady) {
      void start()
    }
  }, [autoStart, status, start, isLoaded, isDataReady])

  const handleDialogOpenChange = useEvent((open: boolean) => {
    setIsDialogOpen(open)
  })

  const handleAiConfigDialogOpenChange = useEvent((open: boolean) => {
    setIsAiConfigDialogOpen(open)
  })

  const openAiConfigDialog = useEvent(() => {
    setIsAiConfigDialogOpen(true)
  })

  /** 配置变更后，上一次失败的原因已不成立，清掉失败状态让用户能直接重新生成（生成中不打断） */
  const clearStaleError = useEvent(() => {
    if (isError) {
      reset()
    }
  })

  const handleAiConfigSave = useEvent((nextConfig: AiRuntimeConfig) => {
    saveAiConfig(nextConfig)
    clearStaleError()
  })

  const handleAiConfigReset = useEvent(() => {
    resetAiConfig()
    clearStaleError()
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

  const getLocalizedErrorMessage = (reportError: AiReportError): string => {
    const errorMessages: Record<AiStreamErrorCode, string> = {
      authError: t('streamErrors.authError'),
      badRequest: t('streamErrors.badRequest'),
      forbidden: t('streamErrors.forbidden'),
      modelNotFound: t('streamErrors.modelNotFound'),
      contextLengthExceeded: t('streamErrors.contextLengthExceeded'),
      rateLimit: t('streamErrors.rateLimit'),
      quotaExceeded: t('streamErrors.quotaExceeded'),
      timeout: t('streamErrors.timeout'),
      gatewayTimeout: t('streamErrors.gatewayTimeout'),
      serviceOverloaded: t('streamErrors.serviceOverloaded'),
      networkError: t('streamErrors.networkError'),
      contentFilter: t('streamErrors.contentFilter'),
      serverError: t('streamErrors.serverError'),
      unknown: t('streamErrors.unknown'),
    }

    return errorMessages[reportError.code] || reportError.message || t('streamErrors.unknown')
  }

  /** 配置入口文案：需要引导时表达动作，其余情况只表示当前配置来源 */
  const getConfigButtonLabel = () => {
    if (showConfigAction) {
      return t('configureCustomAi')
    }

    if (sourceInfo.source === 'custom') {
      return tConfig('configButton')
    }

    return ''
  }

  const renderContent = () => {
    // 生成失败时保留已生成的内容，错误提示置于正文上方
    const errorAlert = isError && error
      ? (
          <Alert variant="error">
            {/* 主信息：面向用户的说明与备选方案 */}
            <AlertTitle>
              {isBuiltinSource ? t('builtinErrorHint') : t('customErrorHint')}
            </AlertTitle>

            {/* 次信息：具体原因弱化展示，便于排查 */}
            <AlertDescription>
              <span>
                {t('errorReasonLabel')}
                {getLocalizedErrorMessage(error)}
              </span>

              {/* 内置服务失败时在内容区给出配置入口；自定义配置的入口在动作区，避免出现两个 */}
              {isBuiltinSource && (
                <Button
                  className="w-fit"
                  size={ACTION_BUTTON_SIZE}
                  variant="outline"
                  onClick={openAiConfigDialog}
                >
                  <SettingsIcon className={ACTION_ICON_SIZE} />
                  {t('configureCustomAi')}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )
      : null

    if (hasText) {
      const reportBody = (
        <div className="p-1 pt-0">
          <ProseContainer className="text-muted-foreground leading-relaxed prose-p:first-of-type:mt-0 prose-p:last-of-type:mb-0 prose-sm">
            <div dangerouslySetInnerHTML={{ __html: markdownHtml }} />
          </ProseContainer>
        </div>
      )

      // 无错误时保持正文原样渲染，避免多包一层容器影响正文间距
      return errorAlert
        ? (
            <div className="flex flex-col gap-2">
              {errorAlert}
              {reportBody}
            </div>
          )
        : reportBody
    }

    if (errorAlert) {
      return errorAlert
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
              {canGenerate ? t('description') : t('waitingForData')}
            </EmptyDescription>

            <Button
              disabled={!canGenerate}
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
        onReset={handleAiConfigReset}
        onSave={handleAiConfigSave}
      />

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <div className="flex flex-col gap-grid-item h-full">
          {/* 内容区 */}
          <div
            aria-busy={isStreaming}
            className="relative flex-1 py-0 overflow-auto"
          >
            {/* 生成中给读屏软件一个状态提示，视觉上由骨架屏表达 */}
            {isStreaming && (
              <span className="sr-only" role="status">
                {t('generating')}
              </span>
            )}

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

              {/* 生成失败 - 重试按钮（此时没有内容可「重新生成」，只保留重试） */}
              {showRetryAction && (
                <Button
                  disabled={!canGenerate}
                  size={ACTION_BUTTON_SIZE}
                  onClick={() => void start()}
                >
                  {t('retry')}
                </Button>
              )}

              {/* 生成失败且无法重试也无法通过改配置解决 - 兜底提供重新生成 */}
              {showErrorFallbackAction && (
                <Button
                  disabled={!canGenerate}
                  size={ACTION_BUTTON_SIZE}
                  variant="outline"
                  onClick={handleRegenerate}
                >
                  <RefreshCwIcon className={ACTION_ICON_SIZE} />
                  {t('regenerate')}
                </Button>
              )}

              {/* 有正文且未失败 - 重新生成按钮（含配置修复后重新开始的情况） */}
              {hasReadableContent && !isError && (
                <Button
                  disabled={!canGenerate}
                  size={ACTION_BUTTON_SIZE}
                  variant="outline"
                  onClick={handleRegenerate}
                >
                  <RefreshCwIcon className={ACTION_ICON_SIZE} />
                  {t('regenerate')}
                </Button>
              )}

              {/* 有正文可复制（含失败时保留的上一版内容） */}
              {hasReadableContent && (
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

              {hasReadableContent && (
                <Tooltip>
                  <TooltipTrigger
                    render={(
                      <DialogTrigger
                        render={(
                          <Button
                            aria-label={t('viewFull')}
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

              {/* 配置入口：动作区只保留这一个，需要引导时它变成主按钮 */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  aria-label={t('configureCustomAi')}
                  size={sourceInfo.source === 'custom' || showConfigAction
                    ? ACTION_BUTTON_SIZE
                    : ACTION_ICON_BUTTON_SIZE}
                  variant={showConfigAction ? 'default' : 'ghost'}
                  onClick={openAiConfigDialog}
                >
                  <SettingsIcon className={ACTION_ICON_SIZE} />
                  {getConfigButtonLabel()}
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
