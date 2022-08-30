import styles from './ThreeDButton.module.css'

export default function ThreeDButton({
  children,
  ...props
}: { children?: React.ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${styles['pushable']}`} {...props}>
      <span className={`${styles['shadow']}`} />
      <span className={`${styles['edge']}`} />
      <span className={`${styles['front']}`}>{children}</span>
    </button>
  )
}
