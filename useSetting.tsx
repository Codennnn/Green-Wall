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
      type: 'showOrigin'
      payload: GraphSettings['showOrigin']
    }
  | {
      type: 'theme'
      payload: GraphSettings['theme']
    }

const initialState: State = { size: DEFAULT_SIZE, theme: DEFAULT_THEME, showOrigin: true }

export default function useSetting() {
  return useReducer((state: State, { type, payload }: Action): State => {
    switch (type) {
      case 'size':
        return { ...state, size: payload }

      case 'showOrigin':
        return { ...state, showOrigin: payload }

      case 'theme':
        return { ...state, theme: payload }

      default:
        throw new Error(`Not a valid type: ${type}.`)
    }
  }, initialState)
}
