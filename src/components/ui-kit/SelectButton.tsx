import { forwardRef } from 'react'

type SelectButtonProps = Omit<React.ComponentProps<'button'>, 'className'>

const InnerSelectButton: React.ForwardRefRenderFunction<HTMLButtonElement, SelectButtonProps> = (
  props,
  ref,
) => {
  return (
    <button
      ref={ref}
      {...props}
      className="
      group
      inline-flex select-none items-center justify-center rounded-md bg-white px-1 py-2
      text-sm font-medium text-main-500 hover:bg-main-50
      radix-state-delayed-open:bg-main-50 radix-state-instant-open:bg-main-100
      radix-state-on:bg-main-50 radix-state-open:bg-main-50
      "
    />
  )
}

export const SelectButton = forwardRef(InnerSelectButton)
