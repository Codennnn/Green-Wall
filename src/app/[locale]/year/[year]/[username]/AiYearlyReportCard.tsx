'use client'

import { useEffect } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  SettingsIcon,
  SparklesIcon,
  SquareIcon,
  WandSparklesIcon,
} from 'lucide-react'

import { AiConfigDialog } from '~/components/AiConfig/AiConfigDialog'
import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from '~/components/ui/empty'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Skeleton } from '~/components/ui/skeleton'
import { useAiConfig } from '~/hooks/useAiConfig'
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard'
import { useYearlyAiReportStream } from '~/hooks/useYearlyAiReportStream'
import { eventTracker } from '~/lib/analytics'
import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

import { StatCard } from './StaticCard'

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

  useEffect(() => {
    // 等待配置加载完成再自动开始
    if (autoStart && status === 'idle' && isLoaded) {
      void start()
    }
  }, [autoStart, status, start, isLoaded])

  const handleCopy = useEvent(async () => {
    if (!text) {
      return
    }

    await copy(text)
    eventTracker.ai.report.copy(year, text.length)
  })

  const handleRegenerate = useEvent(() => {
    reset()
    void start()
  })

  // 状态判断
  const isStreaming = status === 'streaming'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const hasText = text.length > 0

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
                <AiConfigDialog
                  config={aiConfig}
                  trigger={(
                    <Button
                      className="w-fit"
                      size={ACTION_BUTTON_SIZE}
                      variant="outline"
                    >
                      <SettingsIcon className={ACTION_ICON_SIZE} />
                      {t('configureCustomAi')}
                    </Button>
                  )}
                  onReset={resetAiConfig}
                  onSave={saveAiConfig}
                />
              </AlertDescription>
            </Alert>
          )}
        </div>
      )
    }

    if (hasText) {
      return (
        <div className="whitespace-pre-wrap font-sans text-foreground/90 text-sm leading-relaxed p-1">
          {text}
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
      title={t('title')}
    >
      <div className="flex flex-col gap-grid-item h-full">
        {/* 内容区 */}
        <div className="flex-1 py-0 overflow-auto">
          <ScrollArea
            scrollFade
            className="p-grid-item"
          >
            {renderContent()}
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

            <div className="ml-auto flex items-center gap-2">
              <AiConfigDialog
                config={aiConfig}
                trigger={(
                  <Button
                    size={sourceInfo.source === 'custom' ? ACTION_BUTTON_SIZE : 'icon-xs'}
                    variant="ghost"
                  >
                    <SettingsIcon className={ACTION_ICON_SIZE} />
                    {sourceInfo.source === 'custom' ? tConfig('configButton') : ''}
                  </Button>
                )}
                onReset={resetAiConfig}
                onSave={saveAiConfig}
              />
            </div>
          </div>
        )}
      </div>
    </StatCard>
  )
}
