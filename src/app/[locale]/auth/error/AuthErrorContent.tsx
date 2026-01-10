'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { AlertCircleIcon, HomeIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/auth-client'

/** OAuth 错误码到翻译 key 的映射 */
const ERROR_CODE_MAP: Record<string, string> = {
  // 网络相关错误
  connect_timeout: 'networkTimeout',
  network_error: 'networkError',
  fetch_failed: 'networkError',
  // OAuth 流程错误
  invalid_code: 'invalidCode',
  code_expired: 'invalidCode',
  access_denied: 'accessDenied',
  user_cancelled: 'accessDenied',
  // 服务端错误
  server_error: 'serverError',
  temporarily_unavailable: 'serverError',
  // 配置错误
  invalid_client: 'configError',
  invalid_request: 'configError',
}

/**
 * 根据 error query param 获取对应的翻译 key
 */
function getErrorMessageKey(errorCode: string | null): string {
  if (!errorCode) {
    return 'defaultMessage'
  }

  const normalizedCode = errorCode.toLowerCase().replace(/[- ]/g, '_')

  // 检查是否包含特定关键词
  if (normalizedCode.includes('timeout')) {
    return 'networkTimeout'
  }

  if (normalizedCode.includes('network') || normalizedCode.includes('fetch')) {
    return 'networkError'
  }

  if (normalizedCode.includes('denied') || normalizedCode.includes('cancel')) {
    return 'accessDenied'
  }

  return ERROR_CODE_MAP[normalizedCode] ?? 'defaultMessage'
}

interface AuthErrorContentProps {
  locale: string
}

export function AuthErrorContent({ locale }: AuthErrorContentProps) {
  const searchParams = useSearchParams()
  const t = useTranslations('auth.error')

  const errorCode = searchParams.get('error')
  const messageKey = getErrorMessageKey(errorCode)

  const handleRetry = () => {
    void authClient.signIn.social({
      provider: 'github',
      callbackURL: `/${locale}`,
    })
  }

  return (
    <div className="flex max-w-md flex-col items-center gap-6 text-center">
      {/* 错误图标 */}
      <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircleIcon className="size-8 text-destructive" />
      </div>

      {/* 标题 */}
      <h1 className="text-2xl font-semibold">{t('title')}</h1>

      {/* 错误描述 */}
      <p className="text-muted-foreground">
        {t(messageKey)}
      </p>

      {/* 操作按钮 */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="default" onClick={handleRetry}>
          <RefreshCwIcon className="size-4" />
          {t('retry')}
        </Button>

        <Button
          render={(props) => <Link href={`/${locale}`} {...props} />}
          variant="outline"
        >
          <HomeIcon className="size-4" />
          {t('backHome')}
        </Button>
      </div>

      {/* 调试信息（仅开发环境） */}
      {process.env.NODE_ENV === 'development' && errorCode && (
        <div className="mt-4 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
          Error code: {errorCode}
        </div>
      )}
    </div>
  )
}
