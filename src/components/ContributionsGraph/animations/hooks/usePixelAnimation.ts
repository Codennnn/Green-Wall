'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_LEVEL_COLORS } from '~/constants'

import type {
  AnimationEffectConfig,
  PixelMatrix,
  UsePixelAnimationOptions,
  UsePixelAnimationReturn,
} from '../types'

const DEFAULT_WIDTH = 53
const DEFAULT_HEIGHT = 7

interface AnimationState {
  pixelOverrides: PixelMatrix
  frameIndex: number
  elapsed: number
}

function createEmptyMatrix(width: number, height: number): PixelMatrix {
  return Array.from({ length: width }, () =>
    Array.from({ length: height }, () => ({})),
  )
}

function createInitialState(width: number, height: number): AnimationState {
  return {
    pixelOverrides: createEmptyMatrix(width, height),
    frameIndex: 0,
    elapsed: 0,
  }
}

export function usePixelAnimation(
  options: UsePixelAnimationOptions,
): UsePixelAnimationReturn {
  const {
    effect,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    colors = DEFAULT_LEVEL_COLORS,
    speed = 1,
    autoPlay = false,
    onComplete,
    params,
  } = options

  const [state, setState] = useState<AnimationState>(() =>
    createInitialState(width, height),
  )
  const [isPlaying, setIsPlaying] = useState(false)

  // Refs 用于动画循环
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const matrixRef = useRef<PixelMatrix>(createEmptyMatrix(width, height))
  const frameIndexRef = useRef(0)
  const elapsedRef = useRef(0)
  const animateRef = useRef<((timestamp: number) => void) | null>(null)

  // 效果配置
  const configRef = useRef<AnimationEffectConfig>({
    width,
    height,
    colors,
    speed,
    params,
  })

  // 更新配置
  useEffect(() => {
    configRef.current = { width, height, colors, speed, params }
  }, [width, height, colors, speed, params])

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const animate = useCallback(
    (timestamp: number) => {
      if (!effect) {
        return
      }

      const deltaTime = lastTimeRef.current > 0
        ? (timestamp - lastTimeRef.current) * speed
        : 0
      lastTimeRef.current = timestamp

      elapsedRef.current += deltaTime

      // 检查是否超过持续时间
      if (!effect.loop && elapsedRef.current >= effect.defaultDuration) {
        stopLoop()
        setIsPlaying(false)
        onComplete?.()

        return
      }

      const newMatrix = effect.update(
        matrixRef.current,
        frameIndexRef.current,
        deltaTime,
        elapsedRef.current,
        configRef.current,
      )

      matrixRef.current = newMatrix
      frameIndexRef.current += 1

      setState({
        pixelOverrides: newMatrix,
        frameIndex: frameIndexRef.current,
        elapsed: elapsedRef.current,
      })

      if (animateRef.current) {
        rafRef.current = requestAnimationFrame(animateRef.current)
      }
    },
    [effect, speed, stopLoop, onComplete],
  )

  // 保持 animateRef 与 animate 同步
  useEffect(() => {
    animateRef.current = animate
  }, [animate])

  // 播放
  const play = useCallback(() => {
    if (!effect || isPlaying) {
      return
    }

    setIsPlaying(true)
    lastTimeRef.current = 0
    rafRef.current = requestAnimationFrame(animate)
  }, [effect, isPlaying, animate])

  // 暂停
  const pause = useCallback(() => {
    stopLoop()
    setIsPlaying(false)
  }, [stopLoop])

  // 停止并重置
  const stop = useCallback(() => {
    stopLoop()
    setIsPlaying(false)

    // 重置所有状态
    const emptyMatrix = createEmptyMatrix(width, height)
    matrixRef.current = emptyMatrix
    frameIndexRef.current = 0
    elapsedRef.current = 0
    lastTimeRef.current = 0

    setState({
      pixelOverrides: emptyMatrix,
      frameIndex: 0,
      elapsed: 0,
    })
  }, [stopLoop, width, height])

  const reset = useCallback(() => {
    if (!effect) {
      return
    }

    const initialMatrix = effect.setup(configRef.current)
    matrixRef.current = initialMatrix
    frameIndexRef.current = 0
    elapsedRef.current = 0
    lastTimeRef.current = 0

    setState({
      pixelOverrides: initialMatrix,
      frameIndex: 0,
      elapsed: 0,
    })
  }, [effect])

  useEffect(() => {
    if (effect) {
      const initialMatrix = effect.setup(configRef.current)
      matrixRef.current = initialMatrix
      setState((prev) => ({
        ...prev,
        pixelOverrides: initialMatrix,
      }))
    }
  }, [effect])

  useEffect(() => {
    if (autoPlay && effect && !isPlaying) {
      play()
    }
  }, [autoPlay, effect, isPlaying, play])

  useEffect(() => {
    return () => {
      stopLoop()
      effect?.cleanup?.()
    }
  }, [effect, stopLoop])

  return {
    pixelOverrides: state.pixelOverrides,
    isPlaying,
    frameIndex: state.frameIndex,
    elapsed: state.elapsed,
    play,
    pause,
    stop,
    reset,
  }
}
