'use client'

import { useLocale, useTranslations } from 'next-intl'
import { GlobeIcon } from 'lucide-react'

import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '~/components/ui/menu'
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

  const handleLocaleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as Locale })
  }

  return (
    <Menu>
      <MenuTrigger className="flex size-[38px] min-w-0 items-center justify-center rounded-md border-0 bg-main-100 p-0 text-sm font-medium text-main-500 shadow-none ring-4 ring-background transition-colors duration-300 hover:bg-main-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background md:ring-8">
        <GlobeIcon className="size-5.5" />
      </MenuTrigger>

      <MenuPopup>
        <MenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {locales.map((loc) => (
            <MenuRadioItem key={loc.value} value={loc.value}>
              {loc.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
