import type { GitHubUser } from '~/types'

interface UserCardProps {
  login: GitHubUser['login']
  avatarUrl: GitHubUser['avatarUrl']
  isLoading?: boolean
  rightSlot?: React.ReactNode
  badgeText?: string
  onSelect?: (login: UserCardProps['login']) => void
  onRemove?: (login: UserCardProps['login']) => void
}

export function UserCard(props: UserCardProps) {
  const {
    login,
    avatarUrl,
    isLoading,
    rightSlot,
    badgeText,
    onSelect,
    onRemove,
  } = props

  const handleSelect = () => {
    onSelect?.(login)
  }

  const handleRemove = (ev: React.MouseEvent<HTMLButtonElement>) => {
    ev.stopPropagation()
    onRemove?.(login)
  }

  const disabled = Boolean(isLoading)
  const showRemove = Boolean(onRemove)

  return (
    <div className="group relative">
      <button
        className={[
          'flex w-full items-center gap-x-3 rounded-xl border border-main-200 bg-main-50/70 p-3 text-left text-main-600 shadow-xs',
          'hover:bg-main-100 motion-safe:transition-colors motion-safe:duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-300',
          disabled ? 'cursor-wait opacity-70' : 'cursor-pointer',
        ].join(' ')}
        disabled={disabled}
        type="button"
        onClick={handleSelect}
      >
        <div className="bg-main-100 relative size-10 shrink-0 overflow-hidden rounded-full">
          <img
            alt={login}
            className="size-10 object-cover"
            decoding="async"
            loading="lazy"
            src={avatarUrl}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-x-3">
            <div className="truncate font-semibold leading-5">
              {login}
            </div>
            {rightSlot}
          </div>

          {!!badgeText && (
            <div className="text-main-400 mt-1 truncate text-xs">
              {badgeText}
            </div>
          )}
        </div>
      </button>

      {showRemove && (
        <button
          aria-label={`Remove ${login} from recent`}
          className={[
            'absolute right-2 top-2 inline-flex items-center justify-center rounded-md border border-main-200 bg-main-50/80 px-2 py-1 text-xs text-main-500',
            'opacity-0 group-hover:opacity-100 motion-safe:transition-opacity motion-safe:duration-150',
            'hover:bg-main-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main-300',
          ].join(' ')}
          type="button"
          onClick={handleRemove}
        >
          删除
        </button>
      )}
    </div>
  )
}
