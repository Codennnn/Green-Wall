import styles from './GenerateButton.module.css'

interface GenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export default function GenerateButton({ loading = false, ...props }: GenerateButtonProps) {
  return (
    <button
      className={`${styles['pushable']} text-white ${
        loading ? 'pointer-events-none text-opacity-80' : ''
      }`}
      disabled={loading}
      {...props}
    >
      <span className={`${styles['shadow']}`} />
      <span className={`${styles['edge']}`} />
      <span className={`${styles['front']}`}>{loading ? 'Generating...' : 'Generate'}</span>
    </button>
  )
}
