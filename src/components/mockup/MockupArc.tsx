import { cn } from '~/lib/utils'

type MockupArcProps = React.PropsWithChildren<Pick<React.ComponentProps<'div'>, 'className'>>

export function MockupArc(props: MockupArcProps) {
  const { children, className = '' } = props

  return (
    <div className="relative overflow-hidden rounded-3xl p-7">
      <div
        className={cn('relative z-10 overflow-hidden rounded-[12px] border border-solid border-main-200', className)}
      >
        <div className="rounded-[11px] border border-background">
          <div className="rounded-[10px] border border-main-300">
            <div className="overflow-hidden rounded-[9px] border border-white/50">
              <div className="flex items-center gap-x-5 gap-y-2 bg-linear-to-b from-main-100/80 to-main-100/5 p-2">
                <div className="flex gap-2">
                  <div>xxx</div>

                  <div className="rounded p-2 shadow">{children}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-linear-to-b from-(--level-1) to-(--level-0) opacity-20 blur-lg" />
    </div>
  )
}
