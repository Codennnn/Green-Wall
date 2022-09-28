import { useReducer } from 'react'

import { DEFAULT_SIZE, DEFAULT_THEME } from './constants'
import type { GraphSettings } from './types'

type State = GraphSettings

type Action =
  | {
      type: 'size'
      payload: GraphSettings['size']
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
      type: 'displayName'
      payload: GraphSettings['displayName']
    }

const initialState: State = { size: DEFAULT_SIZE, theme: DEFAULT_THEME, showAttribution: true }

export default function useSetting() {
  return useReducer((state: State, { type, payload }: Action): State => {
    switch (type) {
      case 'size':
        return { ...state, size: payload }

      case 'showAttribution':
        return { ...state, showAttribution: payload }

      case 'theme':
        return { ...state, theme: payload }

      case 'displayName':
        return { ...state, displayName: payload }

      default:
        throw new Error(`Not a valid type: ${type}.`)
    }
  }, initialState)
}
