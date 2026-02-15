'use client'

import { useEffect, useRef, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import type { DialogTriggerProps } from '@base-ui-components/react/dialog'
import { RotateCcwIcon, SettingsIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { eventTracker } from '~/lib/analytics'
import type { AiRuntimeConfig, TestConnectionResponse } from '~/types/ai-config'

import { AiConfigForm } from './AiConfigForm'

const EMPTY_CONFIG: AiRuntimeConfig = {
  baseUrl: '',
  apiKey: '',
  model: '',
}

export interface AiConfigDialogProps {
  /** 当前已保存的配置 */
  config: AiRuntimeConfig | null
  /** 触发器（可选，默认为按钮） */
  trigger?: DialogTriggerProps['render']
  /** 控制对话框开关状态（可选，用于受控模式） */
  open?: boolean
  /** 开关状态变化回调（可选，用于受控模式） */
  onOpenChange?: (open: boolean) => void
  /** 重置配置回调 */
  onReset: () => void
  /** 保存配置回调 */
  onSave: (config: AiRuntimeConfig) => void
}

/**
 * AI 配置对话框
 *
 * 设计原则：
 * 1. 草稿状态 (draftConfig) 仅在对话框打开时有效
 * 2. 对话框打开时，从 config prop 初始化草稿
 * 3. 用户编辑时更新草稿，不影响原 config
 * 4. 保存时将草稿提交给父组件
 * 5. 取消/关闭时丢弃草稿
 */
export function AiConfigDialog({
  config,
  onSave,
  onReset,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AiConfigDialogProps) {
  const t = useTranslations('aiConfig')

  // 内部状态（非受控模式使用）
  const [internalOpen, setInternalOpen] = useState(false)
  // 草稿配置：始终有值，不为 null
  const [draftConfig, setDraftConfig] = useState<AiRuntimeConfig>(config ?? EMPTY_CONFIG)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null)

  // 用于追踪对话框是否刚刚打开
  const prevOpenRef = useRef(false)

  // 判断是否为受控模式
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

  // 监听对话框打开事件，初始化草稿配置
  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open

    // 仅在对话框从关闭变为打开时初始化
    if (open && !wasOpen) {
      setDraftConfig(config ?? EMPTY_CONFIG)
      setTestResult(null)
      eventTracker.ai.config.open(config ? 'custom' : 'builtin')
    }
  }, [open, config])

  const handleOpenChange = useEvent((newOpen: boolean) => {
    setOpen(newOpen)
  })

  const handleConfigChange = useEvent((newConfig: AiRuntimeConfig) => {
    setDraftConfig(newConfig)
    setTestResult(null)
  })

  const handleTestAsync = useEvent(async (configToTest: AiRuntimeConfig) => {
    setIsTesting(true)
    setTestResult(null)

    const provider = new URL(configToTest.baseUrl).hostname
    const startTime = performance.now()

    eventTracker.ai.config.test.start(provider)

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiConfig: configToTest }),
      })

      const result = await response.json() as TestConnectionResponse
      const latencyMs = performance.now() - startTime

      if (result.ok) {
        eventTracker.ai.config.test.success(provider, result.latencyMs ?? latencyMs)
      }
      else {
        eventTracker.ai.config.test.error(provider, result.message ?? 'unknown', latencyMs)
      }

      setTestResult(result)
    }
    catch {
      const latencyMs = performance.now() - startTime
      eventTracker.ai.config.test.error(provider, 'network_error', latencyMs)
      setTestResult({ ok: false, message: 'Network error' })
    }
    finally {
      setIsTesting(false)
    }
  })

  const handleTest = useEvent((configToTest: AiRuntimeConfig) => {
    void handleTestAsync(configToTest)
  })

  const handleSave = useEvent(() => {
    const trimmedConfig: AiRuntimeConfig = {
      baseUrl: draftConfig.baseUrl.trim(),
      apiKey: draftConfig.apiKey.trim(),
      model: draftConfig.model.trim(),
    }

    if (trimmedConfig.baseUrl && trimmedConfig.apiKey && trimmedConfig.model) {
      const provider = new URL(trimmedConfig.baseUrl).hostname
      eventTracker.ai.config.save(provider)
      onSave(trimmedConfig)
      setOpen(false)
    }
  })

  const handleReset = useEvent(() => {
    eventTracker.ai.config.reset()
    onReset()
    setDraftConfig(EMPTY_CONFIG)
    setTestResult(null)
    setOpen(false)
  })

  const canSave = draftConfig.baseUrl.trim()
    && draftConfig.apiKey.trim()
    && draftConfig.model.trim()

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {(!isControlled || trigger) && (
        <DialogTrigger
          render={trigger ?? (
            <Button size="icon" variant="ghost">
              <SettingsIcon />
            </Button>
          )}
        />
      )}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <AiConfigForm
            isTesting={isTesting}
            testResult={testResult}
            value={draftConfig}
            onChange={handleConfigChange}
            onTest={handleTest}
          />
        </DialogPanel>

        <DialogFooter>
          {config && (
            <Button
              className="mr-auto"
              variant="ghost"
              onClick={handleReset}
            >
              <RotateCcwIcon className="size-4" />
              {t('resetToDefault')}
            </Button>
          )}

          <Button variant="outline" onClick={() => { setOpen(false) }}>
            {t('cancel')}
          </Button>
          <Button disabled={!canSave} onClick={handleSave}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
