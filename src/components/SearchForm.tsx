import GenerateButton from '~/components/GenerateButton'
import { SearchInput } from '~/components/SearchInput'

interface SearchFormProps {
  value: string
  isLoading: boolean
  onChange: (value: string) => void
  onSubmit: () => void
}

export function SearchForm({
  value,
  isLoading,
  onChange,
  onSubmit,
}: SearchFormProps) {
  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()
    onSubmit()
  }

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    onChange(ev.target.value)
  }

  return (
    <div className="py-12 md:py-16">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
          <SearchInput
            disabled={isLoading}
            value={value}
            onChange={handleChange}
          />
          <GenerateButton loading={isLoading} type="submit" />
        </div>
      </form>
    </div>
  )
}
