import type { GraphSize, Theme, Themes } from './types'

export const themeList: Theme[] = [
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
    mode: 'dark',
  },
]

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
