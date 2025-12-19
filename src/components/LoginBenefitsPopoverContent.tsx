'use client'

import { useTranslations } from 'next-intl'

import { PopoverDescription, PopoverTitle } from '~/components/ui/popover'

export function LoginBenefitsPopoverContent() {
  const t = useTranslations('auth')

  return (
    <>
      <PopoverTitle className="text-base">
        {t('signInBenefitsTitle')}
      </PopoverTitle>
      <PopoverDescription className="mt-1">
        {t('signInBenefitsIntro')}
      </PopoverDescription>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
        <li>{t('signInBenefitsItemYearWrapped')}</li>
        <li>{t('signInBenefitsItemPrivateContrib')}</li>
        <li>{t('signInBenefitsItemDeeperInsights')}</li>
      </ul>

      <div className="mt-3 text-muted-foreground text-xs">
        {t('signInBenefitsFooter')}
      </div>
    </>
  )
}
