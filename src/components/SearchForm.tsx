import { GenerateButton } from '~/components/GenerateButton/GenerateButton'
import { SearchInput } from '~/components/SearchInput'
import type { RecentGitHubUser } from '~/components/UserDiscovery/useRecentUsers'
import { clearPersistedSearchInput, saveSearchInputToStorage } from '~/hooks/usePersistedSearchInput'

interface SearchFormProps {
  value: string
  isLoading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
  recentUsers?: RecentGitHubUser[]
  onSelectUser?: (login: string) => void
  onRemoveUser?: (login: string) => void
  loadingLogin?: string | null
}

export function SearchForm({
  value,
  isLoading,
  onChange,
  onSubmit,
  recentUsers,
  onSelectUser,
  onRemoveUser,
  loadingLogin,
}: SearchFormProps) {
  const handleSubmit = (ev: React.SubmitEvent) => {
    ev.preventDefault()
    clearPersistedSearchInput()
    onSubmit()
  }

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = ev.target.value
    saveSearchInputToStorage(newValue)
    onChange(newValue)
  }

  return (
    <div className="py-12 md:py-16">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
          <SearchInput
            disabled={isLoading}
            isLoading={isLoading}
            loadingLogin={loadingLogin}
            recentUsers={recentUsers}
            value={value}
            onChange={handleChange}
            onRemoveUser={onRemoveUser}
            onSelectUser={onSelectUser}
          />
          <GenerateButton loading={isLoading} type="submit" />
        </div>
      </form>
    </div>
  )
}
