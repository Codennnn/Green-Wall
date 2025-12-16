import { useTranslations } from 'next-intl'

import { cn } from '~/lib/utils'

import styles from './Graph.module.css'

export function GraphLegend() {
  const t = useTranslations('graph')

  return (
    <div className="ml-auto flex items-center text-xs">
      <span>{t('less')}</span>

      <ul className={cn(styles.grids, 'mx-2 grid grid-cols-5 gap-[3px]')}>
        <li className="size-3" data-level="0" />
        <li className="size-3" data-level="1" />
        <li className="size-3" data-level="2" />
        <li className="size-3" data-level="3" />
        <li className="size-3" data-level="4" />
      </ul>

      <span>{t('more')}</span>
    </div>
  )
}
