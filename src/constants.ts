import type { GraphSize, Theme, Themes } from './types'

export const sizeProperties: Record<
  GraphSize,
  {
    ['--block-size']: string
    ['--block-round']: string
    ['--block-gap']: string
  }
> = {
  normal: {
    ['--block-size']: '10px',
    ['--block-round']: '2px',
    ['--block-gap']: '3px',
  },
  medium: {
    ['--block-size']: '11px',
    ['--block-round']: '3px',
    ['--block-gap']: '3px',
  },
  large: {
    ['--block-size']: '12px',
    ['--block-round']: '3px',
    ['--block-gap']: '4px',
  },
}

export const DEFAULT_SIZE: GraphSize = 'normal'
export const DEFAULT_THEME: Themes = 'GitHub'

export const THEMES: Theme[] = [
  {
    name: 'GitHub',
    textColor: '#24292f',
    levelColors: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
    background: '#fff',
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
    name: 'GitHubDark',
    textColor: '#adbac7',
    levelColors: ['#2d333b', '#0e4429', '#006d32', '#26a641', '#39d353'],
    background: '#22272e',
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
    background: '#fff1f2',
    mode: 'light',
  },
  {
    name: 'Indigo',
    textColor: '#312e81',
    levelColors: ['#e0e7ff', '#c7d2fe', '#a5b4fc', '#818cf8', '#6366f1'],
    background: '#eef2ff',
    mode: 'light',
  },
  {
    name: 'Emerald',
    textColor: '#064e3b',
    levelColors: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#10b981', '#059669'],
    background: '#ecfdf5',
    mode: 'light',
  },
  {
    name: 'Sky',
    textColor: '#0c4a6e',
    levelColors: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#06b6d4'],
    background: '#f0f9ff',
    mode: 'light',
  },
  {
    name: 'Amber',
    textColor: '#78350f',
    levelColors: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b'],
    background: '#fffbeb',
    mode: 'light',
  },
]
