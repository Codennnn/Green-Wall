import type { AnimationEffect } from '../types'

import { scrollTextEffect } from './text'

export const effectRegistry: Record<string, AnimationEffect> = {
  scrollText: scrollTextEffect,
}

export function getEffect(id: string): AnimationEffect | undefined {
  return effectRegistry[id]
}

export function getEffectIds(): string[] {
  return Object.keys(effectRegistry)
}
