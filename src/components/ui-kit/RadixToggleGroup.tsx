import * as ToggleGroup from '@radix-ui/react-toggle-group'

import { RadixTooltip } from './RadixTooltip'

const DEFAULT_ITEM_SIZE = 35
const DEFAULT_ITEM_FONT_SIZE = 16

type RadixToggleGroupProps = ToggleGroup.ToggleGroupSingleProps & {
  size?: 'default' | 'small' | 'large' | number
  options?: {
    label: string | React.ReactNode
    value: string
    tooltip?: React.ReactNode
  }[]
}

export function RadixToggleGroup(props: RadixToggleGroupProps) {
  const { size = 'default', options, ...toggleGroupProps } = props

  const itemSize
    = size === 'small'
      ? DEFAULT_ITEM_SIZE - 10
      : size === 'large'
        ? DEFAULT_ITEM_SIZE + 10
        : typeof size === 'number'
          ? size
          : DEFAULT_ITEM_SIZE

  const fontSize
    = size === 'small'
      ? DEFAULT_ITEM_FONT_SIZE - 2
      : size === 'large'
        ? DEFAULT_ITEM_FONT_SIZE + 2
        : typeof size === 'number'
          ? size
          : DEFAULT_ITEM_FONT_SIZE

  return (
    <ToggleGroup.Root
      className="inline-flex rounded bg-white shadow shadow-main-200"
      defaultValue="center"
      {...toggleGroupProps}
    >
      {options?.map((opt) => {
        return (
          <ToggleGroup.Item
            key={opt.value}
            className="
            flex-row-reverse items-center justify-center
            text-main-500 hover:bg-main-100/40
            focus-visible:z-10 toggle-on:bg-main-100 toggle-on:font-medium toggle-on:text-main-700
            "
            style={{ height: itemSize, width: itemSize, fontSize }}
            value={opt.value}
          >
            {opt.tooltip
              ? (
                  <RadixTooltip label={opt.tooltip}>{opt.label}</RadixTooltip>
                )
              : (
                  opt.label
                )}
          </ToggleGroup.Item>
        )
      })}
    </ToggleGroup.Root>
  )
}
