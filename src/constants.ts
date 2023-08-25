import { type ContributionLevel, DisplayName, GraphSize } from '~/enums'

import type { Theme, Themes } from './types'

export const levels = {
  Null: -1,
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
} satisfies Record<ContributionLevel, -1 | 0 | 1 | 2 | 3 | 4>

export const sizeProperties = {
  [GraphSize.Small]: {
    ['--block-size']: '10px',
    ['--block-round']: '2px',
    ['--block-gap']: '3px',
  },
  [GraphSize.Medium]: {
    ['--block-size']: '11px',
    ['--block-round']: '3px',
    ['--block-gap']: '3px',
  },
  [GraphSize.Large]: {
    ['--block-size']: '12px',
    ['--block-round']: '3px',
    ['--block-gap']: '4px',
  },
} as const satisfies Record<
  GraphSize,
  {
    ['--block-size']: string
    ['--block-round']: string
    ['--block-gap']: string
  }
>

export const DEFAULT_SIZE: GraphSize = GraphSize.Small
export const DEFAULT_THEME: Themes = 'GitHub'
export const DEFAULT_DISPLAY_NAME: DisplayName = DisplayName.Username

export const THEMES = [
  {
    name: 'GitHub',
    textColor: '#24292f',
    levelColors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    background: '#fff',
  },
  {
    name: 'GitHubDark',
    textColor: '#adbac7',
    levelColors: ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'],
    background: '#22272e',
    mode: 'dark',
  },
  {
    name: 'Winter',
    textColor: '#adbac7',
    levelColors: ['#2d333b', '#0a3069', '#0969da', '#54aeff', '#b6e3ff'],
    background: '#22272e',
    mode: 'dark',
  },
  {
    name: 'Halloween',
    textColor: '#24292f',
    levelColors: ['#ebedf0', '#ffee4a', '#ffc501', '#fe9600', '#03001c'],
    background: '#fff',
  },
  {
    name: 'GitLab',
    textColor: '#2e2e2e',
    levelColors: ['#ededed', '#acd5f2', '#7fa8c9', '#527ba0', '#254e77'],
    background: '#fff',
  },
  {
    name: 'GitLabDark',
    textColor: '#c0c0c0',
    levelColors: ['#222222', '#263342', '#344e6c', '#416895', '#4f83bf'],
    background: '#181818',
    mode: 'dark',
  },
  {
    name: 'Dracula',
    textColor: '#f8f8f2',
    levelColors: ['#282a36', '#44475a', '#6272a4', '#bd93f9', '#ff79c6'],
    background: '#181818',
    mode: 'light',
  },
  {
    name: 'Slate',
    textColor: '#0f172a',
    levelColors: ['#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155'],
    background: '#f1f5f9',
    mode: 'dark',
  },
  {
    name: 'Rose',
    textColor: '#881337',
    levelColors: ['#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', '#f43f5e'],
    background: '#fff1f288',
    mode: 'light',
  },
  {
    name: 'Indigo',
    textColor: '#312e81',
    levelColors: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
    background: '#eef2ff88',
    mode: 'light',
  },
  {
    name: 'Emerald',
    textColor: '#064e3b',
    levelColors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#10b981', '#059669'],
    background: '#ecfdf588',
    mode: 'light',
  },
  {
    name: 'Sky',
    textColor: '#0c4a6e',
    levelColors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#06b6d4'],
    background: '#f0f9ff88',
    mode: 'light',
  },
  {
    name: 'Amber',
    textColor: '#78350f',
    levelColors: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
    background: '#fffbeb88',
    mode: 'light',
  },
] satisfies Theme[]
