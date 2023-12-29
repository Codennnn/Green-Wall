import styles from './GenerateButton.module.css'

interface GenerateButtonProps extends React.ComponentProps<'button'> {
  loading?: boolean
}

export function GenerateButton({ loading = false, ...props }: GenerateButtonProps) {
  return (
    <button
      className={`${styles['pushable']} select-none text-white ${
        loading ? 'pointer-events-none text-white/80' : ''
      }`}
      disabled={loading}
      {...props}
    >
      <span className={styles['shadow']} />
      <span className={styles['edge']} />
      <span
        className={`${styles['front']} min-w-[max(30vw,200px)] text-center text-lg font-medium md:min-w-[120px] md:text-base`}
      >
        {loading ? 'Generating...' : 'Generate'}
      </span>
    </button>
  )
}
