/** 单个像素的覆盖状态 */
export interface PixelOverride {
  /** 覆盖颜色 */
  color?: string
  /** 覆盖透明度 (0-1) */
  opacity?: number
}

/** 像素矩阵类型 - [weekIndex][dayIndex] */
export type PixelMatrix = PixelOverride[][]

/** 动画帧更新函数 */
export type FrameUpdater = (
  /** 当前像素矩阵 */
  matrix: PixelMatrix,
  /** 当前帧索引 */
  frameIndex: number,
  /** 距离上一帧的时间 (ms) */
  deltaTime: number,
  /** 动画已运行时间 (ms) */
  elapsed: number,
  /** 动画配置 */
  config: AnimationEffectConfig,
) => PixelMatrix

/** 动画效果配置 */
export interface AnimationEffectConfig {
  /** 画布宽度 (周数)，默认 53 */
  width: number
  /** 画布高度 (天数)，默认 7 */
  height: number
  /** 颜色主题 - 对应贡献等级颜色 */
  colors: string[]
  /** 动画速度倍率，默认 1 */
  speed: number
  /** 自定义参数 */
  params?: Record<string, unknown>
}

/** 动画效果定义 */
export interface AnimationEffect {
  /** 效果唯一标识 */
  id: string
  /** 效果名称 */
  name: string
  /** 效果描述 */
  description?: string
  /** 默认持续时间 (ms) */
  defaultDuration: number
  /** 是否循环播放 */
  loop?: boolean
  /** 初始化函数 - 返回初始像素矩阵 */
  setup: (config: AnimationEffectConfig) => PixelMatrix
  /** 帧更新函数 - 返回更新后的像素矩阵 */
  update: FrameUpdater
  /** 清理函数 */
  cleanup?: () => void
}

/** usePixelAnimation Hook 配置 */
export interface UsePixelAnimationOptions {
  /** 动画效果 */
  effect: AnimationEffect | null
  /** 画布宽度 (周数) */
  width?: number
  /** 画布高度 (天数) */
  height?: number
  /** 颜色主题 */
  colors?: string[]
  /** 动画速度倍率 */
  speed?: number
  /** 是否自动播放 */
  autoPlay?: boolean
  /** 播放完成回调 */
  onComplete?: () => void
  /** 自定义参数 */
  params?: Record<string, unknown>
}

/** usePixelAnimation Hook 返回值 */
export interface UsePixelAnimationReturn {
  /** 当前像素矩阵状态 */
  pixelOverrides: PixelMatrix
  /** 是否正在播放 */
  isPlaying: boolean
  /** 当前帧索引 */
  frameIndex: number
  /** 已播放时间 (ms) */
  elapsed: number
  /** 播放 */
  play: () => void
  /** 暂停 */
  pause: () => void
  /** 停止并重置 */
  stop: () => void
  /** 重置到初始状态 */
  reset: () => void
}

/** 动画触发类型 */
export type AnimationTriggerType = 'date' | 'event' | 'manual' | 'random'

/** 动画触发条件配置 */
export interface AnimationTrigger {
  /** 触发类型 */
  type: AnimationTriggerType
  /** 要触发的效果 ID */
  effectId: string
  /** 日期触发配置 (type === 'date' 时使用) */
  dateConfig?: {
    /** 日期列表，格式 'MM-DD' */
    dates: string[]
    /** 时区，默认用户本地时区 */
    timezone?: string
  }
  /** 事件触发配置 (type === 'event' 时使用) */
  eventConfig?: {
    /** 事件名称列表 */
    events: string[]
  }
  /** 随机触发配置 (type === 'random' 时使用) */
  randomConfig?: {
    /** 触发概率 (0-1) */
    probability: number
    /** 冷却时间 (ms) */
    cooldownMs: number
  }
}

/** 用户动画偏好设置 */
export interface AnimationPreferences {
  /** 是否启用动画 */
  enabled: boolean
  /** 减少动画 (无障碍模式) */
  reducedMotion: boolean
  /** 最大帧率 */
  maxFps: number
  /** 禁用的效果 ID 列表 */
  disabledEffects: string[]
}
