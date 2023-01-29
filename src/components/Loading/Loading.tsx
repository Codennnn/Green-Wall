import styles from './Loading.module.css'

export function Loading(props: React.PropsWithChildren<{ active?: boolean }>) {
  return (
    <div className="relative">
      {props.children}

      {props.active && (
        <div className={`${styles['waterfall']} ${props.active ? styles['active'] : ''}`}>
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
