'use client'

import { useState } from 'react'

import Image from 'next/image'

import {
  getLanguageIconUrl,
  getLanguageInitial,
  getLanguageSlug,
} from '~/lib/language-icons'
import { cn } from '~/lib/utils'

export interface LanguageIconProps {
  /**  编程语言名称 */
  language: string
  /**
   * 图标大小（像素）
   * @default 16
   */
  size?: number
  /** 自定义类名 */
  className?: string
}

export function LanguageIcon(props: LanguageIconProps) {
  const {
    language,
    size = 16,
    className,
  } = props

  const [imageError, setImageError] = useState(false)
  const slug = getLanguageSlug(language)
  const initial = getLanguageInitial(language)

  // 如果没有找到对应的 slug 或者图片加载失败，显示占位符
  if (!slug || imageError) {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center rounded-xs bg-muted text-muted-foreground text-xs font-medium', className)}
        style={{
          width: size,
          height: size,
          fontSize: size * 0.7,
        }}
        title={language}
      >
        {initial}
      </span>
    )
  }

  const iconUrl = getLanguageIconUrl(slug)

  return (
    <span
      className={cn('inline-flex shrink-0 items-center justify-center', className)}
      style={{
        width: size,
        height: size,
      }}
      title={language}
    >
      <Image
        unoptimized
        alt={`${language} icon`}
        className="brightness-0 dark:brightness-0 dark:invert"
        height={size}
        src={iconUrl}
        width={size}
        onError={() => {
          setImageError(true)
        }}
      />
    </span>
  )
}
