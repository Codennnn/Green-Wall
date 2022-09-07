import * as SelectPrimitive from '@radix-ui/react-select'

import { iconCheck, iconChevronDown, iconChevronUp } from '../icons'
import Button from './Button'

type SelectProps = SelectPrimitive.SelectProps & {
  items?: { label: string; value: string; disabled?: boolean }[]
}

export default function Select(props: SelectProps) {
  const { items, ...rest } = props

  return (
    <SelectPrimitive.Root {...rest}>
      <SelectPrimitive.Trigger asChild>
        <Button>
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="ml-2 h-4 w-4">{iconChevronDown}</SelectPrimitive.Icon>
        </Button>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Content className="z-50">
        <SelectPrimitive.ScrollUpButton className="flex items-center justify-center text-main-600">
          <span className="h-4 w-4">{iconChevronUp}</span>
        </SelectPrimitive.ScrollUpButton>

        <SelectPrimitive.Viewport className="rounded-lg bg-white p-2 shadow-lg">
          <SelectPrimitive.Group>
            {items?.map((it) => (
              <SelectPrimitive.Item
                key={it.value}
                className="
                relative flex select-none items-center rounded-md px-8 py-2 text-sm font-medium text-main-600
                focus:bg-main-100 focus:outline-none
                radix-disabled:opacity-50
                "
                disabled={it.disabled}
                value={it.value}
              >
                <SelectPrimitive.ItemText>{it.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex h-4 w-4 items-center">
                  {iconCheck}
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Group>
        </SelectPrimitive.Viewport>

        <SelectPrimitive.ScrollDownButton className="flex items-center justify-center text-gray-700">
          <span className="h-4 w-4">{iconChevronDown}</span>
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Root>
  )
}
