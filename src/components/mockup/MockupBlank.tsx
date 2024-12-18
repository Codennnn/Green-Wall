type MockupBlankProps = React.PropsWithChildren<Pick<React.ComponentProps<'div'>, 'className'>>

export function MockupBlank(props: MockupBlankProps) {
  const { children, className = '' } = props

  return (
    <div
      className={`-mx-5 flex flex-col items-center bg-[var(--theme-background,_#fff)] p-5 md:mx-0 ${className}`}
    >
      {children}
    </div>
  )
}
