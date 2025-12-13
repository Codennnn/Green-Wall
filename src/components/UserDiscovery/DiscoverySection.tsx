import type { ReactNode } from 'react'

interface DiscoverySectionProps {
  title: string
  description?: string
  headerRight?: ReactNode
  className?: string
  children: ReactNode
}

export function DiscoverySection(props: DiscoverySectionProps) {
  const { title, description, headerRight, className, children } = props

  const sectionClassName = [
    'border-border bg-background rounded-2xl border p-5 shadow-xs',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={sectionClassName}>
      <div className="flex items-end justify-between gap-x-4">
        <div>
          <h2 className="text-base font-semibold">
            {title}
          </h2>

          {description
            ? (
                <p className="text-muted-foreground mt-1 text-sm">
                  {description}
                </p>
              )
            : null}
        </div>

        {headerRight
          ? (
              <div className="shrink-0">
                {headerRight}
              </div>
            )
          : null}
      </div>

      {children}
    </section>
  )
}
