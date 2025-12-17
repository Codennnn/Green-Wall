'use client'

import { useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { GenerateButton } from '~/components/GenerateButton/GenerateButton'
import { SearchInput } from '~/components/SearchInput'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { normalizeGitHubUsername } from '~/helpers'
import { useRouter } from '~/i18n/navigation'

export function YearSearchPage() {
  const t = useTranslations('yearSearch')
  const router = useRouter()

  const currentYear = new Date().getFullYear()

  const yearOptions = useMemo(() => {
    const years: number[] = []

    for (let year = currentYear; year >= 2008; year--) {
      years.push(year)
    }

    return years
  }, [currentYear])

  const [username, setUsername] = useState('')
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUsernameChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(ev.target.value)
  }

  const handleYearChange = (value: string | null) => {
    if (value !== null) {
      setSelectedYear(value)
    }
  }

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault()

    const normalizedUsername = normalizeGitHubUsername(username)
    const year = Number(selectedYear)

    if (normalizedUsername && year) {
      setIsSubmitting(true)
      router.push(`/year/${year}/${normalizedUsername}`)
    }
  }

  return (
    <div className="py-10 md:py-14">
      <h1 className="text-center text-3xl font-bold md:mx-auto md:px-20 md:text-4xl md:leading-[1.2] lg:text-5xl">
        {t('titleWithYear', { year: currentYear })}
      </h1>

      <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
        {t('descriptionWithYear', { year: currentYear })}
      </p>

      <div className="py-12 md:py-16">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center gap-y-6 md:flex-row md:gap-x-5">
            {/* 用户名输入框 */}
            <SearchInput
              autoFocus={false}
              disabled={isSubmitting}
              placeholder={t('usernamePlaceholder')}
              translationNamespace="yearSearch"
              value={username}
              onChange={handleUsernameChange}
            />

            {/* 年份选择器 */}
            <Select
              disabled={isSubmitting}
              value={selectedYear}
              onValueChange={handleYearChange}
            >
              <SelectTrigger className="h-[2.8rem] w-[140px] justify-center text-center text-lg font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* 提交按钮 */}
            <GenerateButton loading={isSubmitting} type="submit">
              {t('go')}
            </GenerateButton>
          </div>
        </form>
      </div>
    </div>
  )
}
