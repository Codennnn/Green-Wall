import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'zh', 'zh-tw', 'ja'],
  defaultLocale: 'en',
})

export type Locale = (typeof routing.locales)[number]

const localeNativeNames = {
  en: 'English',
  zh: '简体中文',
  'zh-tw': '繁體中文',
  ja: '日本語',
} satisfies Record<Locale, string>

export function getLocaleNativeName(locale: Locale): string {
  return localeNativeNames[locale]
}
