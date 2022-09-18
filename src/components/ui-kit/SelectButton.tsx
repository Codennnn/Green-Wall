import { forwardRef } from 'react'

type ButtonProps = Omit<React.ComponentProps<'button'>, 'className'>

function SelectButton({ children, ...props }: ButtonProps, ref: React.Ref<HTMLButtonElement>) {
  return (
    <button
      ref={ref}
      {...props}
      className="
      group
      inline-flex select-none items-center justify-center rounded-md bg-white px-4 py-2
      text-sm font-medium text-main-500 hover:bg-main-50
      radix-state-delayed-open:bg-main-50 radix-state-instant-open:bg-main-100
      radix-state-on:bg-main-50 radix-state-open:bg-main-50
      "
    >
      {children}
    </button>
  )
}

export default forwardRef(SelectButton)
