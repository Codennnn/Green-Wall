'use client'

import { useState } from 'react'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { MenuIcon } from 'lucide-react'

import { Button } from '~/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetHeader,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { cn } from '~/lib/utils'

interface MainNavProps {
  locale: string
  className?: string
}

export function MainNav({ locale, className }: MainNavProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const [open, setOpen] = useState(false)

  const navItems = [
    {
      href: `/${locale}`,
      label: t('home'),
      // 精确匹配主页路径
      isActive: pathname === `/${locale}` || pathname === '/',
    },
    {
      href: `/${locale}/year`,
      label: t('yearSearch'),
      // 匹配 /year 开头的路径
      isActive: pathname.startsWith(`/${locale}/year`),
    },
  ]

  return (
    <>
      {/* 桌面端导航 */}
      <nav className={cn('hidden items-center gap-1.5 md:flex bg-background ring-4 ring-background', className)}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            className={cn(
              'relative rounded-md px-2 py-1 text-sm font-medium transition-colors',
              'hover:bg-muted',
              item.isActive
                ? 'text-current bg-muted'
                : 'text-muted-foreground',
            )}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 移动端菜单 */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={(
            <Button
              className="md:hidden"
              size="icon-sm"
              variant="ghost"
            />
          )}
        >
          <MenuIcon className="size-5" />
          <span className="sr-only">Toggle menu</span>
        </SheetTrigger>

        <SheetPopup side="left">
          <SheetHeader>
            <SheetTitle>{t('home')}</SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu
            </SheetDescription>
          </SheetHeader>

          <nav className="flex flex-col gap-2 p-6">
            {navItems.map((item) => (
              <SheetClose
                key={item.href}
                render={(
                  <Link
                    className={cn(
                      'flex items-center rounded-md px-4 py-3 text-base font-medium transition-colors',
                      'hover:bg-muted hover:text-muted-foreground',
                      item.isActive
                        ? 'bg-muted text-muted-foreground'
                        : 'text-muted-foreground',
                    )}
                    href={item.href}
                  />
                )}
              >
                {item.label}
              </SheetClose>
            ))}
          </nav>
        </SheetPopup>
      </Sheet>
    </>
  )
}
