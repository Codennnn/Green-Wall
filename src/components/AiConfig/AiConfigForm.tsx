'use client'

import { useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { useTranslations } from 'next-intl'
import {
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  XCircleIcon,
} from 'lucide-react'

import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { AiRuntimeConfig, TestConnectionResponse } from '~/types/ai-config'

export interface AiConfigFormProps {
  /** 当前配置（用于初始化表单） */
  initialConfig: AiRuntimeConfig | null
  /** 配置变更回调 */
  onChange: (config: AiRuntimeConfig) => void
  /** 是否正在测试连接 */
  isTesting?: boolean
  /** 测试结果 */
  testResult?: TestConnectionResponse | null
  /** 测试连接回调 */
  onTest?: (config: AiRuntimeConfig) => void
}

/**
 * AI 配置表单（简化版）
 */
export function AiConfigForm({
  initialConfig,
  onChange,
  isTesting = false,
  testResult,
  onTest,
}: AiConfigFormProps) {
  const t = useTranslations('aiConfig')

  const [baseUrl, setBaseUrl] = useState(initialConfig?.baseUrl ?? '')
  const [apiKey, setApiKey] = useState(initialConfig?.apiKey ?? '')
  const [model, setModel] = useState(initialConfig?.model ?? '')

  const [showApiKey, setShowApiKey] = useState(false)

  const getCurrentConfig = useEvent((): AiRuntimeConfig => {
    return {
      baseUrl: baseUrl.trim(),
      apiKey: apiKey.trim(),
      model: model.trim(),
    }
  })

  const handleFieldChange = useEvent((field: keyof AiRuntimeConfig, value: string) => {
    const newConfig = { ...getCurrentConfig(), [field]: value }

    switch (field) {
      case 'baseUrl':
        setBaseUrl(value)
        break

      case 'apiKey':
        setApiKey(value)
        break

      case 'model':
        setModel(value)
        break
    }

    onChange(newConfig)
  })

  const handleTest = useEvent(() => {
    const config = getCurrentConfig()

    if (config.baseUrl && config.apiKey && config.model) {
      onTest?.(config)
    }
  })

  const isFormValid = baseUrl.trim() && apiKey.trim() && model.trim()

  return (
    <div className="flex flex-col gap-4">
      {/* Base URL */}
      <div className="space-y-2">
        <Label htmlFor="baseUrl">{t('baseUrl')}</Label>
        <Input
          id="baseUrl"
          placeholder={t('baseUrlPlaceholder')}
          value={baseUrl}
          onChange={(e) => { handleFieldChange('baseUrl', e.target.value) }}
        />
        <p className="text-muted-foreground text-xs">
          {t('baseUrlHint')}
        </p>
      </div>

      {/* API Key */}
      <div className="space-y-2">
        <Label htmlFor="apiKey">{t('apiKey')}</Label>
        <div className="relative">
          <Input
            className="pr-10"
            id="apiKey"
            placeholder={t('apiKeyPlaceholder')}
            type={showApiKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => { handleFieldChange('apiKey', e.target.value) }}
          />
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            type="button"
            onClick={() => { setShowApiKey(!showApiKey) }}
          >
            {showApiKey ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
          </button>
        </div>
        <p className="text-muted-foreground text-xs">
          {t('apiKeyHint')}
        </p>
      </div>

      {/* Model */}
      <div className="space-y-2">
        <Label htmlFor="model">{t('model')}</Label>
        <Input
          id="model"
          placeholder={t('modelPlaceholder')}
          value={model}
          onChange={(e) => { handleFieldChange('model', e.target.value) }}
        />
        <p className="text-muted-foreground text-xs">
          {t('modelHint')}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          disabled={!isFormValid || isTesting}
          size="sm"
          type="button"
          variant="outline"
          onClick={handleTest}
        >
          {isTesting && <LoaderIcon className="size-4 animate-spin" />}
          {t('testConnection')}
        </Button>

        {testResult && (
          <div className="flex items-center gap-2 text-sm">
            {testResult.ok
              ? (
                  <>
                    <CheckCircleIcon className="size-4 text-success" />
                    <span className="text-success">
                      {t('testSuccess')}
                    </span>
                  </>
                )
              : (
                  <>
                    <XCircleIcon className="size-4 text-destructive" />
                    <span className="text-destructive">
                      {testResult.message ?? t('testFailed')}
                    </span>
                  </>
                )}
          </div>
        )}
      </div>
    </div>
  )
}
