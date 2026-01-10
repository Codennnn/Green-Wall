import type { PixelMatrix } from '../../types'

import { DEFAULT_PIXEL_FONT, getCharBitmap, hasPixelAt, type PixelFont } from './pixelFont'

/** 文本渲染选项 */
export interface TextRenderOptions {
  /** 要渲染的文本 */
  text: string
  /** 使用的字体 */
  font?: PixelFont
  /** 水平偏移（像素），用于滚动效果 */
  offsetX?: number
  /** 垂直偏移（像素），默认居中 */
  offsetY?: number
  /** 文本颜色 */
  color: string
  /** 透明度 (0-1) */
  opacity?: number
  /** 边缘淡出宽度（像素） */
  fadeEdgeWidth?: number
}

function createEmptyMatrix(width: number, height: number): PixelMatrix {
  return Array.from({ length: width }, () =>
    Array.from({ length: height }, () => ({})),
  )
}

/**
 * 测量文本的总像素宽度
 * @param text 文本内容
 * @param font 字体
 * @returns 文本总宽度（像素）
 */
export function measureText(text: string, font: PixelFont = DEFAULT_PIXEL_FONT): number {
  let width = 0

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === ' ') {
      width += font.spaceWidth
    }
    else {
      width += font.charWidth
    }

    // 添加字符间距（最后一个字符后不加）
    if (i < text.length - 1) {
      width += font.spacing
    }
  }

  return width
}

/**
 * 获取每个字符的起始 X 坐标
 * @param text 文本内容
 * @param font 字体
 * @returns 每个字符的起始 X 坐标数组
 */
export function getCharPositions(text: string, font: PixelFont = DEFAULT_PIXEL_FONT): number[] {
  const positions: number[] = []
  let x = 0

  for (let i = 0; i < text.length; i++) {
    positions.push(x)
    const char = text[i]

    if (char === ' ') {
      x += font.spaceWidth
    }
    else {
      x += font.charWidth
    }

    // 添加字符间距
    if (i < text.length - 1) {
      x += font.spacing
    }
  }

  return positions
}

/**
 * 计算边缘淡出透明度
 * @param x 当前 x 坐标
 * @param width 画布宽度
 * @param fadeWidth 淡出宽度
 * @returns 透明度乘数 (0-1)
 */
function calculateEdgeFade(x: number, width: number, fadeWidth: number): number {
  if (fadeWidth <= 0) {
    return 1
  }

  if (x < fadeWidth) {
    return x / fadeWidth
  }

  if (x >= width - fadeWidth) {
    return (width - 1 - x) / fadeWidth
  }

  return 1
}

/**
 * 将文本渲染到像素矩阵
 * @param width 画布宽度（周数）
 * @param height 画布高度（天数，通常为 7）
 * @param options 渲染选项
 * @returns 像素矩阵
 */
export function renderTextToMatrix(
  width: number,
  height: number,
  options: TextRenderOptions,
): PixelMatrix {
  const {
    text,
    font = DEFAULT_PIXEL_FONT,
    offsetX = 0,
    offsetY,
    color,
    opacity = 1,
    fadeEdgeWidth = 0,
  } = options

  // 创建空白矩阵
  const matrix = createEmptyMatrix(width, height)

  // 计算垂直居中偏移（默认居中）
  const textHeight = font.charHeight
  const defaultOffsetY = Math.floor((height - textHeight) / 2)
  const actualOffsetY = offsetY ?? defaultOffsetY

  // 获取每个字符的位置
  const charPositions = getCharPositions(text, font)

  // 遍历画布上的每个像素
  for (let canvasX = 0; canvasX < width; canvasX++) {
    for (let canvasY = 0; canvasY < height; canvasY++) {
      // 计算对应的文本坐标
      const textX = canvasX - offsetX
      const textY = canvasY - actualOffsetY

      // 检查是否在文本高度范围内
      if (textY < 0 || textY >= font.charHeight) {
        continue
      }

      // 查找该位置属于哪个字符
      let charIndex = -1
      let charLocalX = -1

      for (let i = 0; i < charPositions.length; i++) {
        const charStartX = charPositions[i]
        const char = text[i]
        const charWidth = char === ' ' ? font.spaceWidth : font.charWidth

        if (textX >= charStartX && textX < charStartX + charWidth) {
          charIndex = i
          charLocalX = textX - charStartX
          break
        }
      }

      // 如果没有找到对应字符，跳过
      if (charIndex === -1) {
        continue
      }

      const char = text[charIndex]

      // 空格不渲染像素
      if (char === ' ') {
        continue
      }

      // 获取字符位图
      const bitmap = getCharBitmap(char, font)

      if (!bitmap) {
        continue
      }

      // 检查该位置是否有像素
      if (hasPixelAt(bitmap, charLocalX, textY, font.charWidth)) {
        // 计算边缘淡出
        const edgeFade = calculateEdgeFade(canvasX, width, fadeEdgeWidth)
        const finalOpacity = opacity * edgeFade

        matrix[canvasX][canvasY] = {
          color,
          opacity: finalOpacity,
        }
      }
    }
  }

  return matrix
}

/**
 * 渲染居中文本
 * @param width 画布宽度
 * @param height 画布高度
 * @param text 文本内容
 * @param color 文本颜色
 * @param font 字体
 * @returns 像素矩阵
 */
export function renderCenteredText(
  width: number,
  height: number,
  text: string,
  color: string,
  font: PixelFont = DEFAULT_PIXEL_FONT,
): PixelMatrix {
  const textWidth = measureText(text, font)
  const offsetX = Math.floor((width - textWidth) / 2)

  return renderTextToMatrix(width, height, {
    text,
    font,
    offsetX,
    color,
  })
}
