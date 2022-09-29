import { useReducer } from 'react'

import { DEFAULT_DISPLAY_NAME, DEFAULT_SIZE, DEFAULT_THEME } from './constants'
import type { GraphSettings } from './types'

type State = GraphSettings

type Action =
  | {
      type: 'size'
      payload: GraphSettings['size']
    }
  | {
      type: 'displayName'
      payload: GraphSettings['displayName']
    }
  | {
      type: 'sinceYear'
      payload: GraphSettings['sinceYear']
    }
  | {
      type: 'showAttribution'
      payload: GraphSettings['showAttribution']
    }
  | {
      type: 'theme'
      payload: GraphSettings['theme']
    }
  | {
      type: 'reset'
      payload?: never
    }

const initialState: State = {
  size: DEFAULT_SIZE,
  theme: DEFAULT_THEME,
  displayName: DEFAULT_DISPLAY_NAME,
  showAttribution: true,
}

export default function useSetting() {
  return useReducer((state: State, { type, payload }: Action): State => {
    switch (type) {
      case 'size':
        return { ...state, size: payload }

      case 'displayName':
        return { ...state, displayName: payload }

      case 'sinceYear':
        return { ...state, sinceYear: payload }

      case 'showAttribution':
        return { ...state, showAttribution: payload }

      case 'theme':
        return { ...state, theme: payload }

      case 'reset':
        return initialState

      default:
        throw new Error(`Not a valid type: ${type}.`)
    }
  }, initialState)
}
