import Link from 'next/link'

import { cn } from '~/lib/utils'

export function TextLink({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof Link>>) {
  return (
    <Link
      {...props}
      className={cn(
        'underline decoration-current decoration-dotted underline-offset-[3px] hover:decoration-solid',
        props.className,
      )}
    >
      {children}
    </Link>
  )
}
