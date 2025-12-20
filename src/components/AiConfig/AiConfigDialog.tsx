'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import type { DialogTriggerProps } from '@base-ui-components/react/dialog'
import { AlertTriangleIcon, RotateCcwIcon, SettingsIcon } from 'lucide-react'

import { Alert, AlertDescription } from '~/components/ui/alert'
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

export interface AiConfigDialogProps {
  /** 当前配置 */
  config: AiRuntimeConfig | null
  /** 触发器（可选，默认为按钮） */
  trigger?: DialogTriggerProps['render']
  /** 重置配置回调 */
  onReset: () => void
  /** 保存配置回调 */
  onSave: (config: AiRuntimeConfig) => void
}

export function AiConfigDialog({
  config,
  onSave,
  onReset,
  trigger,
}: AiConfigDialogProps) {
  const t = useTranslations('aiConfig')

  const [open, setOpen] = useState(false)
  const [draftConfig, setDraftConfig] = useState<AiRuntimeConfig | null>(config)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<TestConnectionResponse | null>(null)

  const handleOpenChange = useEvent((newOpen: boolean) => {
    if (newOpen) {
      setDraftConfig(config)
      setTestResult(null)
      eventTracker.ai.config.open(config ? 'custom' : 'builtin')
    }

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
    if (draftConfig?.baseUrl && draftConfig.apiKey && draftConfig.model) {
      const provider = new URL(draftConfig.baseUrl).hostname
      eventTracker.ai.config.save(provider)
      onSave(draftConfig)
      setOpen(false)
    }
  })

  const handleReset = useEvent(() => {
    eventTracker.ai.config.reset()
    onReset()
    setDraftConfig(null)
    setTestResult(null)
    setOpen(false)
  })

  const canSave = draftConfig?.baseUrl && draftConfig.apiKey && draftConfig.model

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={trigger ?? (
          <Button size="icon" variant="ghost">
            <SettingsIcon />
          </Button>
        )}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogTitle')}</DialogTitle>
          <DialogDescription>
            {t('dialogDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogPanel>
          <AiConfigForm
            initialConfig={draftConfig}
            isTesting={isTesting}
            testResult={testResult}
            onChange={handleConfigChange}
            onTest={handleTest}
          />

          <Alert className="mt-4" variant="warning">
            <AlertTriangleIcon />
            <AlertDescription>
              {t('securityWarning')}
            </AlertDescription>
          </Alert>
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
