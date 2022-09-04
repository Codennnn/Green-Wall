import styles from './GenerateButton.module.css'

interface GenerateButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export default function GenerateButton({ loading = false, ...props }: GenerateButtonProps) {
  return (
    <button
      className={`${styles['pushable']} select-none text-white ${
        loading ? 'pointer-events-none text-opacity-80' : ''
      }`}
      disabled={loading}
      {...props}
    >
      <span className={`${styles['shadow']}`} />
      <span className={`${styles['edge']}`} />
      <span className={`${styles['front']} min-w-[max(30vw,200px)] md:min-w-[120px]`}>
        {loading ? 'Generating...' : 'Generate'}
      </span>
    </button>
  )
}
