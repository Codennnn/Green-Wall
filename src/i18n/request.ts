import { locale as rootLocale } from 'next/root-params'
import { hasLocale, type Messages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ locale }) => {
  const requestedLocale = locale ?? await rootLocale()

  const activeLocale = requestedLocale && hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale

  return {
    locale: activeLocale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../../messages/${activeLocale}.json`)).default as Messages,
  }
})
