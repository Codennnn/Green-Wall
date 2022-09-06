import * as SwitchPrimitive from '@radix-ui/react-switch'

type SwitchProps = SwitchPrimitive.SwitchProps

export default function Switch(props: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      className="
      group relative inline-flex h-5 w-10
      shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out
      radix-state-checked:bg-accent-400 radix-state-unchecked:bg-main-200
      "
      {...props}
    >
      <SwitchPrimitive.Thumb
        className="
        pointer-events-none
        inline-block h-4 w-5 rounded-full bg-white transition duration-200 ease-in-out
        group-radix-state-checked:translate-x-4 group-radix-state-unchecked:translate-x-0
        "
      />
    </SwitchPrimitive.Root>
  )
}
