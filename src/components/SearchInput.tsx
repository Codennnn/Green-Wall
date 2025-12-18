import { useEffect, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { Input } from '~/components/ui/input'

import { cn } from '../lib/utils'

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
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [autoFocus])

  return (
    <Input
      ref={inputRef}
      autoComplete="off"
      {...props}
      required
      className={cn(
        'h-[2.8rem] w-2/3 md:w-[240px]',
        '**:data-[slot=input]:placeholder:text-center **:data-[slot=input]:placeholder:font-normal',
        '**:data-[slot=input]:text-base **:data-[slot=input]:font-semibold **:data-[slot=input]:text-center',
        props.className,
      )}
      name="username"
      placeholder={t('searchPlaceholder')}
      size="lg"
      type="text"
      onFocus={() => inputRef.current?.select()}
    />
  )
}
