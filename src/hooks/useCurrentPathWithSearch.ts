import { useMemo } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

/**
 * 返回当前页面的相对地址（pathname + ?query）
 *
 * 用于 Better Auth 的 callbackURL，确保“登录后回到发起登录的页面”。
 */
export function useCurrentPathWithSearch(): string {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useMemo(() => {
    const query = searchParams.toString()

    return query ? `${pathname}?${query}` : pathname
  }, [pathname, searchParams])
}
