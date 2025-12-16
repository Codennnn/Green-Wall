import Link from 'next/link'

export function TextLink({
  children,
  ...props
}: React.PropsWithChildren<React.ComponentProps<typeof Link>>) {
  return (
    <Link
      {...props}
      className={`underline decoration-current decoration-dotted underline-offset-[3px] hover:decoration-solid ${
        props.className ?? ''
      }`}
    >
      {children}
    </Link>
  )
}
