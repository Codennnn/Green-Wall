import styles from './GenerateButton.module.css'

interface GenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export default function GenerateButton({ loading = false, ...props }: GenerateButtonProps) {
  return (
    <button
      className={`${styles['pushable']} ${loading ? 'pointer-events-none' : ''}`}
      disabled={loading}
      {...props}
    >
      <span className={`${styles['shadow']}`} />
      <span className={`${styles['edge']}`} />
      <span className={`${styles['front']}`}>{loading ? 'Generating...' : 'Generate'}</span>
    </button>
  )
}
