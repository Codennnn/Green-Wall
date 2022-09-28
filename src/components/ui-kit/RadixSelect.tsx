import * as Select from '@radix-ui/react-select'

import { iconChevronDown, iconChevronUp } from '../icons'
import SelectButton from './SelectButton'

type SelectProps = Select.SelectProps & {
  items?: { label: string; value: string; disabled?: boolean }[]
}

export function RadixSelect(props: SelectProps) {
  const { items, ...rest } = props

  return (
    <Select.Root {...rest}>
      <Select.Trigger asChild>
        <SelectButton>
          <Select.Value />
          <Select.Icon className="ml-2 h-4 w-4">{iconChevronDown}</Select.Icon>
        </SelectButton>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content className="z-50">
          <Select.ScrollUpButton className="flex items-center justify-center text-main-600">
            <span className="h-4 w-4">{iconChevronUp}</span>
          </Select.ScrollUpButton>

          <Select.Viewport className="rounded-lg bg-white p-2 shadow-lg">
            <Select.Group>
              {items?.map((it) => (
                <Select.Item
                  key={it.value}
                  className="
                  relative flex cursor-pointer select-none items-center rounded-md px-1 py-2 text-sm font-medium
                  text-main-600 focus:bg-main-100/50 focus:outline-none
                  radix-disabled:opacity-50
                  "
                  disabled={it.disabled}
                  value={it.value}
                >
                  <Select.ItemIndicator className="absolute inset-0 flex cursor-default items-center justify-center rounded-md bg-main-100">
                    {it.label}
                  </Select.ItemIndicator>
                  <Select.ItemText>{it.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>

          <Select.ScrollDownButton className="flex items-center justify-center text-gray-700">
            <span className="h-4 w-4">{iconChevronDown}</span>
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
