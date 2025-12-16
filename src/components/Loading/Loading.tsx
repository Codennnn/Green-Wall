import { cn } from '~/lib/utils'

import styles from './Loading.module.css'

export function Loading(props: React.PropsWithChildren<{ active?: boolean }>) {
  const { active } = props

  return (
    <div className="relative">
      {props.children}

      {props.active && (
        <div className={cn(styles.waterfall, active && styles.active)}>
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
      )}
    </div>
  )
}
