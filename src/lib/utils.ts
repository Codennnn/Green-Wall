import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将 rgb(r, g, b) 或 rgba(r, g, b, a) 格式的颜色转换为 #rrggbb 格式
 * 这是必需的，因为 html-to-image 需要绝对颜色值而不是 CSS 函数
 * 注意：alpha 通道会被忽略，因为 SVG 导出不支持透明度
 */
export function rgbToHex(rgb: string): string {
  const match = /rgba?\((\d+),?\s*(\d+),?\s*(\d+)/.exec(rgb)

  if (!match) {
    return rgb
  }

  const r = Math.min(255, Math.max(0, Number.parseInt(match[1], 10)))
  const g = Math.min(255, Math.max(0, Number.parseInt(match[2], 10)))
  const b = Math.min(255, Math.max(0, Number.parseInt(match[3], 10)))

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
