import { useEffect, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import { XIcon } from 'lucide-react'

import {
  Autocomplete,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from '~/components/ui/autocomplete'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import type { RecentGitHubUser } from '~/components/UserDiscovery/useRecentUsers'
import { cn } from '~/lib/utils'

interface SearchInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  autoFocus?: boolean
  translationNamespace?: string
  recentUsers?: RecentGitHubUser[]
  onSelectUser?: (login: string) => void
  onRemoveUser?: (login: string) => void
  isLoading?: boolean
  loadingLogin?: string | null
  value?: string
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void
}

export function SearchInput({
  autoFocus = false,
  translationNamespace = 'home',
  recentUsers = [],
  onSelectUser,
  onRemoveUser,
  isLoading = false,
  loadingLogin = null,
  value,
  onChange,
  ...props
}: SearchInputProps) {
  const t = useTranslations(translationNamespace)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const blurTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 0)
    }
  }, [autoFocus])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const hasRecentUsers = recentUsers.length > 0

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }

    inputRef.current?.select()

    if (hasRecentUsers) {
      setIsOpen(true)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      blurTimeoutRef.current = window.setTimeout(() => {
        setIsOpen(false)
      }, 200)
    }
    else {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }

      setIsOpen(open)
    }
  }

  const handleValueChange = (newValue: string) => {
    const matchedUser = recentUsers.find((user) => user.login === newValue)

    if (matchedUser) {
      setIsOpen(false)
      onSelectUser?.(newValue)
    }
  }

  const handleRemoveUser = (login: string, ev: React.MouseEvent) => {
    ev.stopPropagation()
    ev.preventDefault()
    onRemoveUser?.(login)
  }

  return (
    <Autocomplete
      itemToStringValue={(user) => user.login}
      items={recentUsers}
      mode="none"
      open={isOpen && hasRecentUsers}
      value={value ?? ''}
      onOpenChange={handleOpenChange}
      onValueChange={handleValueChange}
    >
      <div className="relative">
        <AutocompleteInput
          ref={inputRef}
          data-1p-ignore
          data-bwignore
          autoComplete="off"
          data-form-type="other"
          data-lpignore="true"
          {...props}
          required
          className={cn(
            'h-[2.8rem] w-2/3 md:w-[240px]',
            '**:data-[slot=autocomplete-input]:placeholder:text-center **:data-[slot=autocomplete-input]:placeholder:font-normal',
            '**:data-[slot=autocomplete-input]:text-base **:data-[slot=autocomplete-input]:font-semibold **:data-[slot=autocomplete-input]:text-center',
            props.className,
          )}
          name="username"
          placeholder={t('searchPlaceholder')}
          size="lg"
          type="text"
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
        />
      </div>

      <AutocompletePopup sideOffset={8}>
        <ScrollArea className="max-h-[250px]">
          <AutocompleteList>
            {(user: RecentGitHubUser) => {
              const isLoadingUser = Boolean(
                isLoading && loadingLogin && loadingLogin === user.login,
              )

              return (
                <AutocompleteItem
                  key={user.login}
                  className="group"
                  disabled={isLoadingUser}
                  value={user}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="flex-1 flex items-center gap-3">
                      <div className="bg-secondary size-7 shrink-0 overflow-hidden rounded-full border border-border">
                        <img
                          alt={user.login}
                          className="size-full object-cover"
                          decoding="async"
                          loading="lazy"
                          src={user.avatarUrl}
                        />

                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold leading-5">
                          {user.login}
                        </div>
                      </div>
                    </div>

                    {typeof onRemoveUser === 'function' && (
                      <Button
                        aria-label={`Remove ${user.login} from recent`}
                        className="ml-auto opacity-0 group-hover:opacity-100 text-muted-foreground"
                        size="icon-xs"
                        type="button"
                        variant="ghost"
                        onClick={(ev) => {
                          handleRemoveUser(user.login, ev)
                        }}
                      >
                        <XIcon />
                      </Button>
                    )}
                  </div>
                </AutocompleteItem>
              )
            }}
          </AutocompleteList>
        </ScrollArea>
      </AutocompletePopup>
    </Autocomplete>
  )
}
