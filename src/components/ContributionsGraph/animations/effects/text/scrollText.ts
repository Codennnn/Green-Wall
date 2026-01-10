import type { AnimationEffect, AnimationEffectConfig, PixelMatrix } from '../../types'

import { DEFAULT_PIXEL_FONT } from './pixelFont'
import { measureText, renderTextToMatrix } from './textRenderer'

/** 滚动文本效果参数 */
export interface ScrollTextParams {
  /** 显示的文本内容 */
  text?: string
  /** 滚动速度（每帧移动的像素数），默认 0.5 */
  scrollSpeed?: number
  /** 是否启用边缘淡出效果，默认 true */
  fadeEdges?: boolean
  /** 边缘淡出宽度（像素），默认 5 */
  fadeEdgeWidth?: number
  /** 文本透明度，默认 1 */
  opacity?: number
}

/** 默认绿色（GitHub 贡献图的最深绿色） */
const DEFAULT_GREEN_COLOR = '#216e39'

/** 默认参数 */
const DEFAULT_PARAMS: Required<ScrollTextParams> = {
  text: 'View Report',
  scrollSpeed: 0.5,
  fadeEdges: true,
  fadeEdgeWidth: 5,
  opacity: 1,
}

/**
 * 从主题颜色中获取有效的文本颜色
 * 优先使用最深的颜色（level-4），如果是 CSS 变量则回退到默认绿色
 */
function getTextColorFromTheme(colors: string[]): string {
  // 从最深到最浅尝试获取有效颜色
  for (let i = colors.length - 1; i >= 0; i--) {
    const color = colors[i]

    // 跳过 CSS 变量和函数
    if (color && !color.includes('var(') && !color.includes('color-mix(')) {
      return color
    }
  }

  return DEFAULT_GREEN_COLOR
}

/** 滚动文本参数（含颜色） */
type ScrollTextParamsWithColor = Required<ScrollTextParams> & { color: string }

/** 从配置中提取滚动文本参数 */
function getScrollTextParams(config: AnimationEffectConfig): ScrollTextParamsWithColor {
  const params = config.params as ScrollTextParams | undefined

  return {
    text: params?.text ?? DEFAULT_PARAMS.text,
    scrollSpeed: params?.scrollSpeed ?? DEFAULT_PARAMS.scrollSpeed,
    fadeEdges: params?.fadeEdges ?? DEFAULT_PARAMS.fadeEdges,
    fadeEdgeWidth: params?.fadeEdgeWidth ?? DEFAULT_PARAMS.fadeEdgeWidth,
    opacity: params?.opacity ?? DEFAULT_PARAMS.opacity,
    // 直接从主题颜色获取
    color: getTextColorFromTheme(config.colors),
  }
}

/** 创建空白像素矩阵 */
function createEmptyMatrix(width: number, height: number): PixelMatrix {
  return Array.from({ length: width }, () =>
    Array.from({ length: height }, () => ({})),
  )
}

/**
 * 滚动文本动画效果
 * 文本从右侧进入，向左滚动，完全离开左侧后循环
 */
export const scrollTextEffect: AnimationEffect = {
  id: 'scrollText',
  name: 'Scroll Text',
  description: '滚动显示文本提示，引导用户发现新功能',
  defaultDuration: 10000,
  loop: true,

  setup(config: AnimationEffectConfig): PixelMatrix {
    return createEmptyMatrix(config.width, config.height)
  },

  update(matrix, frameIndex, _deltaTime, _elapsed, config): PixelMatrix {
    const params = getScrollTextParams(config)
    const { text, scrollSpeed, color, fadeEdges, fadeEdgeWidth, opacity } = params

    // 测量文本宽度
    const textWidth = measureText(text, DEFAULT_PIXEL_FONT)

    // 计算滚动总距离：画布宽度 + 文本宽度（确保文本完全进入和离开）
    const totalScrollDistance = config.width + textWidth

    // 计算当前偏移（从右侧开始）
    // 使用帧索引和速度计算位置，取模实现循环
    const scrollOffset = (frameIndex * scrollSpeed) % totalScrollDistance

    // offsetX 是文本左边缘相对于画布左边缘的位置
    // 初始位置在画布右侧外（offsetX = config.width）
    // 最终位置在画布左侧外（offsetX = -textWidth）
    const offsetX = config.width - scrollOffset

    return renderTextToMatrix(config.width, config.height, {
      text,
      font: DEFAULT_PIXEL_FONT,
      offsetX: Math.round(offsetX),
      color,
      opacity,
      fadeEdgeWidth: fadeEdges ? fadeEdgeWidth : 0,
    })
  },
}

export default scrollTextEffect
