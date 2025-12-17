'use client'

import { useEffect } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import { div } from 'framer-motion/client'
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  SparklesIcon,
  SquareIcon,
  WandSparklesIcon,
} from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
} from '~/components/ui/empty'
import { Skeleton } from '~/components/ui/skeleton'
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard'
import { useYearlyAiReportStream } from '~/hooks/useYearlyAiReportStream'
import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

import { StatCard } from './StaticCard'

export interface AiYearlyReportCardProps {
  username: string
  year: number
  locale?: string
  tags: YearlyReportTags
  highlights?: YearlyReportHighlights
  /** 是否自动开始生成 */
  autoStart?: boolean
}

export function AiYearlyReportCard(props: AiYearlyReportCardProps) {
  const {
    username,
    year,
    locale,
    tags,
    highlights,
    autoStart = false,
  } = props

  const t = useTranslations('aiReport')
  const { copied, copy } = useCopyToClipboard()

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
  })

  useEffect(() => {
    if (autoStart && status === 'idle') {
      void start()
    }
  }, [autoStart, status, start])

  const handleCopy = useEvent(async () => {
    if (!text) {
      return
    }

    await copy(text)
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
      return (
        <Alert variant="error">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
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
              <WandSparklesIcon />
              {t('generate')}
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    )
  }

  return (
    <StatCard
      cardClassName="h-full"
      icon={<SparklesIcon className="size-5" />}
      title={t('title')}
    >
      <div className="flex flex-col gap-grid-item h-full">
        {/* 内容区 */}
        <div className="flex-1 p-grid-item py-0">
          {renderContent()}
        </div>

        {/* 操作按钮 */}
        <div className="mt-auto flex items-center gap-2 p-grid-item-sm pt-0">
          {/* 生成中 - 取消按钮 */}
          {isStreaming && (
            <Button size="xs" variant="outline" onClick={abort}>
              <SquareIcon className="size-3.5" />
              {t('cancel')}
            </Button>
          )}

          {/* 生成完成或失败 - 重新生成按钮 */}
          {(isSuccess || isError || (status === 'aborted' && hasText)) && (
            <Button size="xs" variant="outline" onClick={handleRegenerate}>
              <RefreshCwIcon className="size-3.5" />
              {t('regenerate')}
            </Button>
          )}

          {/* 错误状态 - 重试按钮 */}
          {isError && (
            <Button size="xs" onClick={() => void start()}>
              {t('retry')}
            </Button>
          )}

          {/* 生成完成 - 复制按钮 */}
          {isSuccess && hasText && (
            <Button
              className="ml-auto"
              size="xs"
              variant="outline"
              onClick={() => void handleCopy()}
            >
              {copied
                ? (
                    <>
                      <CheckIcon className="size-3.5" />
                      {t('copied')}
                    </>
                  )
                : (
                    <>
                      <CopyIcon className="size-3.5" />
                      {t('copy')}
                    </>
                  )}
            </Button>
          )}
        </div>
      </div>
    </StatCard>
  )
}
