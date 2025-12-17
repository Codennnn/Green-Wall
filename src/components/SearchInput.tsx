import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

interface SearchInputProps extends React.ComponentProps<'input'> {
  autoFocus?: boolean
  translationNamespace?: string
}

export function SearchInput({
  autoFocus = true,
  translationNamespace = 'home',
  ...props
}: SearchInputProps) {
  const t = useTranslations(translationNamespace)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  return (
    <input
      ref={inputRef}
      autoComplete="off"
      {...props}
      required
      className="
        inline-block h-[2.8rem] overflow-hidden rounded-lg bg-main-100 px-5
        text-center text-lg font-medium text-main-600 caret-main-500 shadow-main-300/60 outline-none
        transition-all duration-300
        placeholder:select-none placeholder:font-normal placeholder:text-main-400
        focus:bg-background focus:shadow-[0_0_1.2rem_var(--tw-shadow-color)]
      "
      name="username"
      placeholder={t('searchPlaceholder')}
      type="text"
      onFocus={() => inputRef.current?.select()}
    />
  )
}
