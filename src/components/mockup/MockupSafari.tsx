import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  LockIcon,
  PlusIcon,
  RotateCwIcon,
  ShareIcon,
} from 'lucide-react'

import { useData } from '~/DataContext'
import { cn } from '~/lib/utils'

type MockupSafariProps = React.PropsWithChildren<Pick<React.ComponentProps<'div'>, 'className'>>

export function MockupSafari(props: MockupSafariProps) {
  const { children, className = '' } = props

  const { graphData, settings } = useData()

  return (
    <div className="relative overflow-hidden rounded-3xl p-[calc(var(--block-size)*3.5)]">
      <div className={cn('relative z-10 overflow-hidden', className)}>
        <div className="rounded-2xl border-2 border-double border-(--theme-border) bg-(--theme-background)">
          {settings.showSafariHeader && (
            <div className="relative flex h-14 items-center gap-x-2 px-6">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-[rgb(232,106,94)]" />
                <div className="size-3 rounded-full bg-[rgb(241,190,80)]" />
                <div className="size-3 rounded-full bg-[rgb(97,196,84)]" />
              </div>

              <div className="flex items-center px-4 opacity-70">
                <ChevronLeftIcon className="size-5" />
                <ChevronRightIcon className="size-5" />
              </div>

              {!!graphData?.login && (
                <div className="absolute inset-x-0 mx-auto flex w-fit min-w-[290px] items-center justify-between gap-2 rounded-lg border-2 border-[color-mix(in_srgb,var(--theme-border),transparent_50%)] bg-(--theme-secondary) p-1 px-2">
                  <LockIcon className="size-3.5 opacity-70" />
                  <div className="text-xs opacity-70">{`github.com/${graphData.login}`}</div>
                  <RotateCwIcon className="size-3.5 opacity-70" />
                </div>
              )}

              <div className="ml-auto flex items-center gap-3 opacity-70">
                <ShareIcon className="size-4" />
                <PlusIcon className="size-4" />
                <CopyIcon className="size-4" />
              </div>
            </div>
          )}

          <div>{children}</div>
        </div>
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: 'var(--theme-background-container)',
        }}
      />
    </div>
  )
}
