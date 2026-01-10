import { BlockShape, ColorScheme, type ContributionLevel, GraphSize } from '~/enums'

import type { ThemePreset, Themes } from './types'

export const enum StorageKeys {
  /** 搜索输入持久化存储键 */
  SearchInput = 'greenwall.searchInput.v1',
  /** AI 配置持久化存储键 */
  AiConfig = 'greenwall.aiConfig.v1',
  /** 最近搜索的 GitHub 用户存储键 */
  RecentUsers = 'gw:recent_github_users:v1',
}

export const levels = {
  Null: -1,
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} satisfies Record<ContributionLevel, -1 | 0 | 1 | 2 | 3 | 4>

export const DEFAULT_LEVEL_COLORS: ThemePreset['levelColors'] = [
  '#ebedf0',
  '#9be9a8',
  '#40c463',
  '#30a14e',
  '#216e39',
]

/**
 * 图表基础尺寸配置（像素值）
 */
export const GRAPH_SIZE_BASE = {
  small: { blockSize: 10, blockGap: 2, blockRound: 2 },
  medium: { blockSize: 11, blockGap: 2.5, blockRound: 3 },
  large: { blockSize: 12, blockGap: 4, blockRound: 3 },
} as const

/**
 * 图表 CSS 变量配置
 *
 * 根据不同尺寸设置对应的 CSS 变量值，用于控制：
 * - 图表容器的实际像素尺寸
 * - HTML 元素（月份标签、星期标签、图例）的布局
 * - SVG 容器的外部尺寸
 */
export const sizeProperties = {
  [GraphSize.Small]: {
    ['--block-size']: `${GRAPH_SIZE_BASE.small.blockSize}px`,
    ['--block-round']: `${GRAPH_SIZE_BASE.small.blockRound}px`,
    ['--block-gap']: `${GRAPH_SIZE_BASE.small.blockGap}px`,
  },
  [GraphSize.Medium]: {
    ['--block-size']: `${GRAPH_SIZE_BASE.medium.blockSize}px`,
    ['--block-round']: `${GRAPH_SIZE_BASE.medium.blockRound}px`,
    ['--block-gap']: `${GRAPH_SIZE_BASE.medium.blockGap}px`,
  },
  [GraphSize.Large]: {
    ['--block-size']: `${GRAPH_SIZE_BASE.large.blockSize}px`,
    ['--block-round']: `${GRAPH_SIZE_BASE.large.blockRound}px`,
    ['--block-gap']: `${GRAPH_SIZE_BASE.large.blockGap}px`,
  },
} as const satisfies Record<
  GraphSize,
  {
    ['--block-size']: string
    ['--block-round']: string
    ['--block-gap']: string
  }
>

/**
 * SVG 热力图相关常量
 *
 * 这些常量用于 SVG viewBox 坐标系统，基于 Small 尺寸的像素值计算相对比例。
 * SVG 使用相对单位，通过 CSS 控制实际渲染尺寸，确保缩放时保持正确的比例。
 */
const _base = GRAPH_SIZE_BASE.small
const _cellUnit = _base.blockSize + _base.blockGap

export const SVG_GRAPH_CONSTANTS = {
  DAYS_IN_WEEK: 7,
  CELL_UNIT: 1,
  BLOCK_RATIO: _base.blockSize / _cellUnit,
  CORNER_RADIUS_SQUARE: _base.blockRound / _cellUnit,
  CORNER_RADIUS_ROUND: (_base.blockSize / _cellUnit) / 2,
} as const

export const DEFAULT_SIZE: GraphSize = GraphSize.Small

export const DEFAULT_THEME: Themes = 'Classic'

export const DEFAULT_BLOCK_SHAPE: BlockShape = BlockShape.Square

export const THEME_PRESETS = [
  {
    name: 'Classic',
    mode: ColorScheme.Light,
    colorForeground: '#24292f',
    colorBackground: '#fff',
    colorSecondary: 'rgba(245, 245, 245, 0.38)',
    colorPrimary: 'rgb(56, 56, 56)',
    colorBorder: 'color-mix(in srgb, rgba(218, 218, 218, 0.48), transparent 0%)',
    colorBackgroundContainer:
      'linear-gradient(140deg, rgb(241 245 249 / 0.8) 0%, rgb(241 245 249 / 0.5) 100%)',
    levelColors: DEFAULT_LEVEL_COLORS,
  },
  {
    name: 'Midnight',
    mode: ColorScheme.Dark,
    colorForeground: 'rgba(255, 255, 255, 0.98)',
    colorBackground: 'rgba(0, 0, 0, 0.76)',
    colorSecondary: 'rgba(115, 115, 115, 0.15)',
    colorPrimary: 'rgba(135, 231, 242, 1)',
    colorBorder: 'rgba(105, 105, 105, 0.5)',
    colorBackgroundContainer: 'linear-gradient(140deg, rgb(76, 200, 200) 0%, rgb(32, 32, 51) 100%)',
    levelColors: [
      'var(--theme-secondary)',
      'color-mix(in srgb, var(--theme-primary) 35%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 75%, var(--theme-secondary))',
      'var(--theme-primary)',
    ],
  },
  {
    name: 'Sunset',
    mode: ColorScheme.Dark,
    colorForeground: '#fff',
    colorBackground: 'rgba(16, 4, 4, 0.84)',
    colorSecondary: 'rgba(60, 32, 32, 0.85)',
    colorPrimary: 'rgba(251, 165, 157, 1)',
    colorBorder: 'color-mix(in srgb, rgba(176, 172, 172, 0.36), transparent 0%)',
    colorBackgroundContainer: 'url(/images/background/sunset.webp) no-repeat center center / cover',
    levelColors: [
      'color-mix(in srgb, var(--theme-primary) 10%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 35%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 75%, var(--theme-secondary))',
      'var(--theme-primary)',
    ],
  },
  {
    name: 'Violet',
    mode: ColorScheme.Dark,
    colorForeground: 'rgb(235, 234, 234)',
    colorBackground: 'rgba(21, 21, 39, 0.92)',
    colorSecondary: 'rgba(48, 48, 80, 0.8)',
    colorPrimary: 'rgba(156, 156, 210, 1)',
    colorBorder: 'color-mix(in srgb, rgba(97, 97, 121, 0.55), transparent 0%)',
    colorBackgroundContainer: 'url(/images/background/lead.webp) no-repeat center center / cover',
    levelColors: [
      'var(--theme-secondary)',
      'color-mix(in srgb, var(--theme-primary) 35%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 60%, var(--theme-secondary))',
      'color-mix(in srgb, var(--theme-primary) 75%, var(--theme-secondary))',
      'var(--theme-primary)',
    ],
  },
  {
    name: 'GreenWall',
    mode: ColorScheme.Light,
    colorForeground: '#24292f',
    colorBackground: '#fff',
    colorSecondary: 'rgba(245, 245, 245, 0.38)',
    colorPrimary: 'rgb(56, 56, 56)',
    colorBorder: 'color-mix(in srgb, rgba(218, 218, 218, 0.48), transparent 0%)',
    colorBackgroundContainer:
      'var(--color-slate-50)',
    levelColors: [
      '#ebedf0',
      'var(--color-brand-300)',
      'var(--color-brand-500)',
      'var(--color-brand-700)',
      'var(--color-brand-900)',
    ],
    selectable: false,
  },
] satisfies ThemePreset[]
