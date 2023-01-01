import { useReducer } from 'react'

import { DEFAULT_DISPLAY_NAME, DEFAULT_SIZE, DEFAULT_THEME } from './constants'
import type { GraphSettings } from './types'

type State = GraphSettings

type Action =
  | {
      type: 'size'
      payload: State['size']
    }
  | {
      type: 'displayName'
      payload: State['displayName']
    }
  | {
      type: 'yearRange'
      payload: State['yearRange']
    }
  | {
      type: 'showAttribution'
      payload: State['showAttribution']
    }
  | {
      type: 'theme'
      payload: State['theme']
    }
  | {
      type: 'reset'
      payload?: never
    }
  | {
      type: 'replace'
      payload?: State
    }

const initialState: State = {
  size: DEFAULT_SIZE,
  theme: DEFAULT_THEME,
  displayName: DEFAULT_DISPLAY_NAME,
  showAttribution: true,
}

export function useGraphSetting() {
  return useReducer((state: State, { type, payload }: Action): State => {
    switch (type) {
      case 'size':
        return { ...state, size: payload }

      case 'displayName':
        return { ...state, displayName: payload }

      case 'yearRange':
        return { ...state, yearRange: payload }

      case 'showAttribution':
        return { ...state, showAttribution: payload }

      case 'theme':
        return { ...state, theme: payload }

      case 'reset':
        return initialState

      case 'replace':
        if (payload) {
          return payload
        }
        return state

      default:
        throw new Error(`Not a valid type: ${type}.`)
    }
  }, initialState)
}
