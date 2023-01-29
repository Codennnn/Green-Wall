import Link from 'next/link'

export function TextLink({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof Link>>) {
  return (
    <Link
      {...props}
      className={`underline decoration-current decoration-dotted underline-offset-[3px] transition-colors duration-200 hover:text-main-500/90 ${
        props.className ?? ''
      }`}
    >
      {children}
    </Link>
  )
}
