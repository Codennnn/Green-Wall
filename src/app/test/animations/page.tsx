'use client'

import { useMemo, useState } from 'react'

import {
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react'

import { effectRegistry,
  getEffect,
  getEffectIds,
  type ScrollTextParams,
  usePixelAnimation,
} from '~/components/ContributionsGraph/animations'
import { GraphSvgBlocks } from '~/components/ContributionsGraph/GraphSvgBlocks'
import { ThemeSelector } from '~/components/ThemeSelector'
import { ThemeVariablesProvider } from '~/components/ThemeVariablesProvider'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Slider, SliderValue } from '~/components/ui/slider'
import { Switch } from '~/components/ui/switch'
import { DEFAULT_LEVEL_COLORS, THEME_PRESETS } from '~/constants'
import { BlockShape, ContributionLevel } from '~/enums'
import { cn } from '~/lib/utils'
import type { ContributionCalendar, Themes } from '~/types'

/** 模拟周数 */
const MOCK_WEEKS_COUNT = 53
/** 每周天数 */
const DAYS_PER_WEEK = 7

/** 速度选项配置 */
const SPEED_CONFIG = {
  min: 0.25,
  max: 3,
  step: 0.25,
  default: 1,
}

/**
 * 生成空白的贡献数据
 * 所有方块都设为 NONE 级别，这样初始状态显示为空白
 * 动画效果会通过 pixelOverrides 覆盖这些空白方块
 */
function generateEmptyWeeks(): ContributionCalendar['weeks'] {
  const weeks: ContributionCalendar['weeks'] = []
  const today = new Date()

  for (let weekIndex = 0; weekIndex < MOCK_WEEKS_COUNT; weekIndex++) {
    const days = []

    for (let dayIndex = 0; dayIndex < DAYS_PER_WEEK; dayIndex++) {
      const daysAgo = (MOCK_WEEKS_COUNT - weekIndex - 1) * 7 + (6 - dayIndex)
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)

      days.push({
        level: ContributionLevel.NONE,
        count: 0,
        date: date.toISOString().split('T')[0],
      })
    }

    weeks.push({ days })
  }

  return weeks
}

/** 格式化播放时间 */
function formatElapsedTime(ms: number): string {
  const seconds = ms / 1000

  return `${seconds.toFixed(1)}s`
}

/** 获取播放状态文本 */
function getPlaybackStatusText(isPlaying: boolean, elapsed: number): string {
  if (isPlaying) {
    return '播放中'
  }

  if (elapsed > 0) {
    return '已暂停'
  }

  return '已停止'
}

export default function AnimationTestPage() {
  // 空白贡献数据 - 初始状态显示为空白，动画通过 pixelOverrides 覆盖
  const emptyWeeks = useMemo(() => generateEmptyWeeks(), [])

  // 动画效果选择
  const effectIds = getEffectIds()
  const [selectedEffectId, setSelectedEffectId] = useState<string>(effectIds[0] ?? 'scrollText')
  const selectedEffect = useMemo(() => getEffect(selectedEffectId) ?? null, [selectedEffectId])

  // 动画速度
  const [speed, setSpeed] = useState(SPEED_CONFIG.default)

  // 颜色主题
  const [selectedTheme, setSelectedTheme] = useState<Themes>(() => {
    const firstSelectableTheme = THEME_PRESETS.find((preset) => preset.selectable !== false)

    return firstSelectableTheme?.name ?? 'Classic'
  })
  const currentColors = useMemo(() => {
    const theme = THEME_PRESETS.find((preset) => preset.name === selectedTheme)

    return theme?.levelColors ?? DEFAULT_LEVEL_COLORS
  }, [selectedTheme])

  // 滚动文本效果参数
  const [scrollText, setScrollText] = useState('View 2024 Report')
  const [scrollSpeed, setScrollSpeed] = useState(0.5)
  const [fadeEdges, setFadeEdges] = useState(true)

  // 构建效果参数
  const effectParams = useMemo<Record<string, unknown> | undefined>(() => {
    if (selectedEffectId === 'scrollText') {
      return {
        text: scrollText,
        scrollSpeed,
        fadeEdges,
      } satisfies ScrollTextParams
    }

    return undefined
  }, [selectedEffectId, scrollText, scrollSpeed, fadeEdges])

  // 使用像素动画 hook
  const {
    pixelOverrides,
    isPlaying,
    frameIndex,
    elapsed,
    play,
    pause,
    stop,
    reset,
  } = usePixelAnimation({
    effect: selectedEffect,
    width: MOCK_WEEKS_COUNT,
    height: DAYS_PER_WEEK,
    colors: currentColors,
    speed,
    autoPlay: false,
    params: effectParams,
  })

  // 事件处理函数
  const handlePlayPause = () => {
    if (isPlaying) {
      pause()
    }
    else {
      play()
    }
  }

  const handleStop = () => {
    stop()
  }

  const handleReset = () => {
    reset()
  }

  const handleEffectChange = (value: string | null) => {
    if (value) {
      setSelectedEffectId(value)
      stop()
    }
  }

  const handleSpeedChange = (value: number | readonly number[]) => {
    if (typeof value === 'number') {
      setSpeed(value)
    }
    else if (Array.isArray(value) && value.length > 0) {
      const firstValue = value[0] as number
      setSpeed(firstValue)
    }
  }

  const handleThemeChange = (theme: Themes) => {
    setSelectedTheme(theme)
  }

  return (
    <ThemeVariablesProvider theme={selectedTheme}>
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* 页面标题 */}
          <header className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              动画测试页面
            </h1>
            <p className="mt-2 text-muted-foreground">
              演示和调试 GraphSvgBlocks 组件的像素动画功能
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* MARK: 左侧：动画演示区域 */}
            <Card>
              <CardHeader>
                <CardTitle>动画演示</CardTitle>
                <CardDescription>
                  {selectedEffect?.name ?? '未选择效果'}
                  {selectedEffect?.description && ` - ${selectedEffect.description}`}
                </CardDescription>
              </CardHeader>
              <CardPanel>
                <div
                  className={cn(
                    'overflow-x-auto rounded-lg border bg-card p-4',
                    'dark:bg-card/50',
                  )}
                >
                  <div
                    className="inline-block"
                    style={{
                      '--block-size': '10px',
                      '--block-round': '2px',
                      '--block-gap': '2px',
                    } as React.CSSProperties}
                  >
                    <GraphSvgBlocks
                      animationMode={isPlaying || elapsed > 0}
                      blockShape={BlockShape.Square}
                      computedColors={currentColors}
                      pixelOverrides={pixelOverrides}
                      weeks={emptyWeeks}
                    />
                  </div>
                </div>
              </CardPanel>
            </Card>

            {/* MARK: 右侧：调试控制面板 */}
            <div className="flex flex-col gap-4">
              {/* 动画效果选择 */}
              <Card className="py-4">
                <CardPanel>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">动画效果</Label>
                    <Select
                      value={selectedEffectId}
                      onValueChange={handleEffectChange}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {effectIds.map((id) => {
                          const effect = effectRegistry[id]

                          return (
                            <SelectItem key={id} value={id}>
                              {effect.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </CardPanel>
              </Card>

              {/* 滚动文本效果参数 */}
              {selectedEffectId === 'scrollText' && (
                <Card className="py-4">
                  <CardPanel>
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">文本设置</Label>

                      {/* 文本输入 */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">显示文本</Label>
                        <Input
                          placeholder="输入要显示的文本..."
                          value={scrollText}
                          onChange={(e) => { setScrollText(e.target.value) }}
                        />
                      </div>

                      {/* 滚动速度 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs text-muted-foreground">滚动速度</Label>
                          <span className="text-xs text-muted-foreground">
                            {scrollSpeed.toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          max={2}
                          min={0.1}
                          step={0.1}
                          value={scrollSpeed}
                          onValueChange={(value) => {
                            if (typeof value === 'number') {
                              setScrollSpeed(value)
                            }
                            else if (Array.isArray(value) && value.length > 0) {
                              setScrollSpeed(value[0] as number)
                            }
                          }}
                        >
                          <SliderValue />
                        </Slider>
                      </div>

                      {/* 边缘淡出 */}
                      <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">边缘淡出</Label>
                        <Switch
                          checked={fadeEdges}
                          onCheckedChange={setFadeEdges}
                        />
                      </div>
                    </div>
                  </CardPanel>
                </Card>
              )}

              {/* 播放控制 */}
              <Card className="py-4">
                <CardPanel>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">播放控制</Label>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handlePlayPause}
                      >
                        {isPlaying
                          ? <PauseIcon className="size-4" />
                          : <PlayIcon className="size-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleStop}
                      >
                        <SquareIcon className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleReset}
                      >
                        <RotateCcwIcon className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardPanel>
              </Card>

              {/* 动画速度 */}
              <Card className="py-4">
                <CardPanel>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">动画速度</Label>
                      <span className="text-sm text-muted-foreground">
                        {speed.toFixed(2)}x
                      </span>
                    </div>
                    <Slider
                      max={SPEED_CONFIG.max}
                      min={SPEED_CONFIG.min}
                      step={SPEED_CONFIG.step}
                      value={speed}
                      onValueChange={handleSpeedChange}
                    >
                      <SliderValue />
                    </Slider>
                  </div>
                </CardPanel>
              </Card>

              {/* 颜色主题 */}
              <Card className="py-4">
                <CardPanel>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">颜色主题</Label>
                    <ThemeSelector
                      value={selectedTheme}
                      onChange={handleThemeChange}
                    />
                  </div>
                </CardPanel>
              </Card>

              {/* 动画状态 */}
              <Card className="py-4">
                <CardPanel>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">动画状态</Label>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">帧数</span>
                        <span className="font-mono">{frameIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">播放时间</span>
                        <span className="font-mono">{formatElapsedTime(elapsed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">状态</span>
                        <span
                          className={cn(
                            'font-medium',
                            isPlaying && 'text-green-600 dark:text-green-400',
                            !isPlaying && elapsed > 0 && 'text-yellow-600 dark:text-yellow-400',
                            !isPlaying && elapsed === 0 && 'text-muted-foreground',
                          )}
                        >
                          {getPlaybackStatusText(isPlaying, elapsed)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardPanel>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ThemeVariablesProvider>
  )
}
