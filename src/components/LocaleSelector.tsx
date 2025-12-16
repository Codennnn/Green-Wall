'use client'

import { useLocale, useTranslations } from 'next-intl'
import { GlobeIcon } from 'lucide-react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { usePathname, useRouter } from '~/i18n/navigation'
import { type Locale, routing } from '~/i18n/routing'

export function LocaleSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('locale')

  const locales = routing.locales.map((loc) => {
    const NATIVE_NAMES: Record<Locale, string> = {
      en: 'English',
      zh: '简体中文',
    }

    return {
      value: loc,
      label: `${t(loc)} (${NATIVE_NAMES[loc]})`,
    }
  })

  const handleLocaleChange = (newLocale: Locale | null) => {
    if (newLocale) {
      router.replace(pathname, { locale: newLocale })
    }
  }

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="flex size-[38px] min-w-0 items-center rounded-md border-0 bg-main-100! p-0 text-sm font-medium text-main-500! shadow-none ring-4 ring-background transition-colors duration-300 hover:bg-main-200! focus-visible:ring-0 md:ring-8 before:shadow-none **:data-[slot=select-icon]:hidden">
        <span className="size-full flex items-center justify-center">
          <GlobeIcon className="size-5.5" />
        </span>
      </SelectTrigger>

      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc.value} value={loc.value}>
            {loc.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
