import { hasLocale, type Messages } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !hasLocale(routing.locales, locale)) {
    locale = routing.defaultLocale
  }

  return {
    locale,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    messages: (await import(`../../messages/${locale}.json`)).default as Messages,
  }
})
