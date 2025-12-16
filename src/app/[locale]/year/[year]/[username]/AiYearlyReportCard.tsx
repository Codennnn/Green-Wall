'use client'

import { useCallback, useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'
import {
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  SparklesIcon,
  SquareIcon,
} from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
import { Button } from '~/components/ui/button'
import { useYearlyAiReportStream } from '~/hooks/useYearlyAiReportStream'
import type {
  YearlyReportHighlights,
  YearlyReportTags,
} from '~/types/ai-report'

import { SpinningLoader, StaticCard, StaticCardTitle } from './StaticCard'

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
  const [copied, setCopied] = useState(false)

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

  // 自动开始（可选）
  useEffect(() => {
    if (autoStart && status === 'idle') {
      void start()
    }
  }, [autoStart, status, start])

  // 复制文案
  const handleCopy = useCallback(async () => {
    if (!text) {
      return
    }

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
    catch {
      // 忽略复制失败
    }
  }, [text])

  // 重新生成
  const handleRegenerate = useCallback(() => {
    reset()
    void start()
  }, [reset, start])

  // 状态判断
  const isIdle = status === 'idle'
  const isStreaming = status === 'streaming'
  const isSuccess = status === 'success'
  const isError = status === 'error'
  const hasText = text.length > 0

  return (
    <StaticCard contentClassName="flex-col items-stretch gap-3 py-3">
      {/* 标题栏 */}
      <div className="flex items-center gap-x-3">
        <StaticCardTitle icon={<SparklesIcon className="size-5" />}>
          {t('title')}
        </StaticCardTitle>

        <div className="ml-auto flex items-center gap-2">
          {isStreaming && <SpinningLoader />}
        </div>
      </div>

      {/* 内容区 */}
      <div className="min-h-[80px]">
        {/* 空闲状态 - 显示生成按钮 */}
        {isIdle && !hasText && (
          <div className="flex flex-col items-center justify-center gap-3 py-4">
            <p className="text-center text-muted-foreground text-sm">
              {t('description')}
            </p>
            <Button size="sm" onClick={() => void start()}>
              <SparklesIcon />
              {t('generate')}
            </Button>
          </div>
        )}

        {/* 文本展示区 */}
        {hasText && (
          <div className="relative">
            <div className="whitespace-pre-wrap font-sans text-foreground/90 text-sm leading-relaxed p-1">
              {text}
            </div>
          </div>
        )}

        {/* 错误提示 */}
        {isError && error && (
          <Alert className="mt-2" variant="error">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 生成中 - 取消按钮 */}
        {isStreaming && (
          <Button size="sm" variant="outline" onClick={abort}>
            <SquareIcon className="size-3.5" />
            {t('cancel')}
          </Button>
        )}

        {/* 生成完成或失败 - 重新生成按钮 */}
        {(isSuccess || isError || (status === 'aborted' && hasText)) && (
          <Button size="sm" variant="outline" onClick={handleRegenerate}>
            <RefreshCwIcon className="size-3.5" />
            {t('regenerate')}
          </Button>
        )}

        {/* 错误状态 - 重试按钮 */}
        {isError && (
          <Button size="sm" onClick={() => void start()}>
            {t('retry')}
          </Button>
        )}

        {/* 生成完成 - 复制按钮 */}
        {isSuccess && hasText && (
          <Button
            className="ml-auto"
            size="sm"
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
    </StaticCard>
  )
}
