import type { Theme } from './types'

const themes: Theme[] = [
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

export default themes

export function applyTheme(name: Theme['name']) {
  const graph = window.document.getElementById('contributions-graph')
  const theme = themes.find((item) => item.name.toLowerCase() === name.toLowerCase())

  if (graph && theme) {
    graph.style.setProperty('--graph-text-color', theme.textColor)
    graph.style.setProperty('--graph-bg', theme.background)
    theme.levelColors.forEach((color, i) => {
      graph.style.setProperty(`--level-${i}`, color)
    })
  }
}
