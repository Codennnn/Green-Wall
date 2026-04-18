import { useReducer } from 'react'

import { DEFAULT_BLOCK_SHAPE, DEFAULT_SIZE, DEFAULT_THEME } from '~/constants'
import type { GraphSettings } from '~/types'

type State = GraphSettings

export type GraphSettingAction
  = | {
    type: 'size'
    payload: State['size']
  }
  | {
    type: 'yearRange'
    payload: State['yearRange']
  }
  | {
    type: 'daysLabel'
    payload: State['daysLabel']
  }
  | {
    type: 'showSafariHeader'
    payload: State['showSafariHeader']
  }
  | {
    type: 'showAttribution'
    payload: State['showAttribution']
  }
  | {
    type: 'blockShape'
    payload: State['blockShape']
  }
  | {
    type: 'theme'
    payload: State['theme']
  }
  | {
    type: 'globalScale'
    payload: State['globalScale']
  }
  | {
    type: 'reset'
    payload?: never
  }
  | {
    /** Replace all existing settings. */
    type: 'replace'
    payload?: State
  }

const initialState: State = {
  size: DEFAULT_SIZE,
  theme: DEFAULT_THEME,
  blockShape: DEFAULT_BLOCK_SHAPE,
  daysLabel: false,
  showAttribution: true,
  showSafariHeader: true,
}

function updateState<Key extends keyof State>(
  state: State,
  key: Key,
  value: State[Key],
): State {
  if (Object.is(state[key], value)) {
    return state
  }

  return { ...state, [key]: value }
}

function updateYearRange(
  state: State,
  yearRange: State['yearRange'],
): State {
  if (
    state.yearRange?.[0] === yearRange?.[0]
    && state.yearRange?.[1] === yearRange?.[1]
  ) {
    return state
  }

  return { ...state, yearRange }
}

function graphSettingReducer(
  state: State,
  { type, payload }: GraphSettingAction,
): State {
  switch (type) {
    case 'size':
      return updateState(state, 'size', payload)

    case 'yearRange':
      return updateYearRange(state, payload)

    case 'daysLabel':
      return updateState(state, 'daysLabel', payload)

    case 'showSafariHeader':
      return updateState(state, 'showSafariHeader', payload)

    case 'showAttribution':
      return updateState(state, 'showAttribution', payload)

    case 'blockShape':
      return updateState(state, 'blockShape', payload)

    case 'theme':
      return updateState(state, 'theme', payload)

    case 'globalScale':
      return updateState(state, 'globalScale', payload)

    case 'reset':
      return initialState

    case 'replace':
      if (payload) {
        return payload
      }

      return state

    default:
      throw new Error('Not a valid action type.')
  }
}

export function useGraphSetting() {
  return useReducer(graphSettingReducer, initialState)
}
