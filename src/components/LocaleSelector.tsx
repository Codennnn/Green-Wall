'use client'

import { useLocale, useTranslations } from 'next-intl'
import { LanguagesIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Menu,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '~/components/ui/menu'
import { usePathname, useRouter } from '~/i18n/navigation'
import { getLocaleNativeName, type Locale, routing } from '~/i18n/routing'

export function LocaleSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('locale')

  const locales = routing.locales.map((loc) => {
    return {
      value: loc,
      label: `${t(loc)}${loc !== locale ? ` (${getLocaleNativeName(loc)})` : ''}`,
    }
  })

  const handleLocaleChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <Menu>
      <MenuTrigger
        render={(
          <Button
            size="icon"
            variant="outline"
          >
            <LanguagesIcon />
          </Button>
        )}
      />

      <MenuPopup>
        <MenuRadioGroup
          value={locale}
          onValueChange={handleLocaleChange}
        >
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
