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

import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from '~/components/ui/autocomplete'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import type { AiRuntimeConfig, TestConnectionResponse } from '~/types/ai-config'

const AI_PROVIDERS: { name: string, url: string }[] = [
  { name: 'OpenAI', url: 'https://api.openai.com/v1' },
  { name: 'DeepSeek', url: 'https://api.deepseek.com' },
  { name: '通义千问', url: 'https://dashscope.aliyuncs.com/compatible-mode/v1' },
  { name: '智谱 AI', url: 'https://open.bigmodel.cn/api/paas/v4' },
  { name: 'Minimax', url: 'https://api.minimax.chat/v1' },
] as const

export interface AiConfigFormProps {
  /** 当前配置值（受控模式） */
  value: AiRuntimeConfig
  /** 配置变更回调 */
  onChange: (config: AiRuntimeConfig) => void
  /** 是否正在测试连接 */
  isTesting?: boolean
  /** 测试结果 */
  testResult?: TestConnectionResponse | null
  /** 测试连接回调 */
  onTest?: (config: AiRuntimeConfig) => void
}

export function AiConfigForm({
  value,
  onChange,
  isTesting = false,
  testResult,
  onTest,
}: AiConfigFormProps) {
  const t = useTranslations('aiConfig')

  const [isBaseUrlOpen, setIsBaseUrlOpen] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const handleFieldChange = useEvent((field: keyof AiRuntimeConfig, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  })

  const handleTest = useEvent(() => {
    const trimmedConfig: AiRuntimeConfig = {
      baseUrl: value.baseUrl.trim(),
      apiKey: value.apiKey.trim(),
      model: value.model.trim(),
    }

    if (trimmedConfig.baseUrl && trimmedConfig.apiKey && trimmedConfig.model) {
      onTest?.(trimmedConfig)
    }
  })

  const isFormValid = value.baseUrl.trim() && value.apiKey.trim() && value.model.trim()

  return (
    <div className="flex flex-col gap-4">
      {/* MARK: Base URL */}
      <div className="space-y-2">
        <Label htmlFor="baseUrl">{t('baseUrl')}</Label>
        <Autocomplete
          items={AI_PROVIDERS.map((p) => p.url)}
          itemToStringValue={(url) => {
            const provider = AI_PROVIDERS.find((p) => p.url === url)

            if (provider) {
              return provider.url
            }

            return url
          }}
          mode="none"
          open={isBaseUrlOpen}
          value={value.baseUrl}
          onOpenChange={setIsBaseUrlOpen}
          onValueChange={(v) => { handleFieldChange('baseUrl', v) }}
        >
          <AutocompleteInput
            showTrigger
            id="baseUrl"
            placeholder={t('baseUrlPlaceholder')}
            showClear={!!value.baseUrl}
            onClick={() => { setIsBaseUrlOpen(true) }}
          />
          <AutocompletePopup>
            <AutocompleteList>
              {(url: string) => {
                const provider = AI_PROVIDERS.find((p) => p.url === url)

                return (
                  <AutocompleteItem key={url} value={url}>
                    <span className="text-foreground whitespace-nowrap">{provider?.name}</span>
                    <span className="text-muted-foreground text-xs">
                      <span className="mx-1.5">-</span>
                      {url}
                    </span>
                  </AutocompleteItem>
                )
              }}
            </AutocompleteList>
          </AutocompletePopup>
        </Autocomplete>
      </div>

      {/* MARK: API Key */}
      <div className="space-y-2">
        <Label htmlFor="apiKey">{t('apiKey')}</Label>
        <div className="relative">
          <Input
            className="pr-10"
            id="apiKey"
            placeholder={t('apiKeyPlaceholder')}
            type={showApiKey ? 'text' : 'password'}
            value={value.apiKey}
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

      {/* MARK: Model */}
      <div className="space-y-2">
        <Label htmlFor="model">{t('model')}</Label>
        <Input
          id="model"
          placeholder={t('modelPlaceholder')}
          value={value.model}
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
