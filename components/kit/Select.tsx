import * as RdxSelect from '@radix-ui/react-select'

import { iconChevronDown, iconChevronUp } from '../icons'
import Button from './Button'

type SelectProps = RdxSelect.SelectProps & {
  items?: { label: string; value: string; disabled?: boolean }[]
}

export default function Select(props: SelectProps) {
  const { items, ...rest } = props

  return (
    <RdxSelect.Root {...rest}>
      <RdxSelect.Trigger asChild>
        <Button>
          <RdxSelect.Value />
          <RdxSelect.Icon className="ml-2 h-4 w-4">{iconChevronDown}</RdxSelect.Icon>
        </Button>
      </RdxSelect.Trigger>

      <RdxSelect.Content className="z-50">
        <RdxSelect.ScrollUpButton className="flex items-center justify-center text-main-600">
          <span className="h-4 w-4">{iconChevronUp}</span>
        </RdxSelect.ScrollUpButton>

        <RdxSelect.Viewport className="rounded-lg bg-white p-2 shadow-lg">
          <RdxSelect.Group>
            {items?.map((it) => (
              <RdxSelect.Item
                key={it.value}
                className="
                relative flex cursor-pointer select-none items-center rounded-md px-7 py-2 text-sm font-medium
                text-main-600 focus:bg-main-100/50 focus:outline-none
                radix-disabled:opacity-50
                "
                disabled={it.disabled}
                value={it.value}
              >
                <RdxSelect.ItemIndicator className="absolute inset-0 flex cursor-default items-center justify-center rounded-md bg-main-100">
                  {it.label}
                </RdxSelect.ItemIndicator>
                <RdxSelect.ItemText>{it.label}</RdxSelect.ItemText>
              </RdxSelect.Item>
            ))}
          </RdxSelect.Group>
        </RdxSelect.Viewport>

        <RdxSelect.ScrollDownButton className="flex items-center justify-center text-gray-700">
          <span className="h-4 w-4">{iconChevronDown}</span>
        </RdxSelect.ScrollDownButton>
      </RdxSelect.Content>
    </RdxSelect.Root>
  )
}
