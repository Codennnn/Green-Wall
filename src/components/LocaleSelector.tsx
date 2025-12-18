'use client'

import { useLocale, useTranslations } from 'next-intl'
import { GlobeIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
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
      <MenuTrigger
        render={(
          <Button
            size="icon"
            variant="outline"
          >
            <GlobeIcon />
          </Button>
        )}
      />

      <MenuPopup>
        <MenuRadioGroup value={locale} onValueChange={handleLocaleChange}>
          {locales.map((loc) => (
            <MenuRadioItem
              key={loc.value}
              closeOnClick
              value={loc.value}
            >
              {loc.label}
            </MenuRadioItem>
          ))}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  )
}
