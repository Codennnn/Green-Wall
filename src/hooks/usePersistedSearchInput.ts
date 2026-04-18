import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { StorageKeys } from '~/constants'

type SearchInputStorageListener = (value: string) => void
type SearchInputUpdater = string | ((prevValue: string) => string)

const searchInputStorageListeners = new Set<SearchInputStorageListener>()

let cachedSearchInput: string | undefined
let isStorageListenerAttached = false

function loadSearchInputFromStorage(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  if (cachedSearchInput !== undefined) {
    return cachedSearchInput
  }

  try {
    const stored = localStorage.getItem(StorageKeys.SearchInput)
    cachedSearchInput = stored ?? ''

    return cachedSearchInput
  }
  catch {
    cachedSearchInput = ''

    return ''
  }
}

export function saveSearchInputToStorage(value: string): void {
  const nextValue = value

  if (cachedSearchInput === nextValue) {
    return
  }

  if (typeof window === 'undefined') {
    cachedSearchInput = nextValue

    return
  }

  try {
    if (nextValue) {
      localStorage.setItem(StorageKeys.SearchInput, nextValue)
    }
    else {
      localStorage.removeItem(StorageKeys.SearchInput)
    }

    cachedSearchInput = nextValue
  }
  catch {
    // 忽略存储错误
  }
}

export function clearPersistedSearchInput(): void {
  if (cachedSearchInput === '') {
    return
  }

  if (typeof window === 'undefined') {
    cachedSearchInput = ''

    return
  }

  try {
    localStorage.removeItem(StorageKeys.SearchInput)
    cachedSearchInput = ''
  }
  catch {
    // 忽略存储错误
  }
}

function notifySearchInputStorageListeners(value: string): void {
  searchInputStorageListeners.forEach((listener) => {
    listener(value)
  })
}

function handleSearchInputStorageChange(event: StorageEvent): void {
  if (event.key !== StorageKeys.SearchInput && event.key !== null) {
    return
  }

  const nextValue = event.key === null ? '' : event.newValue ?? ''

  cachedSearchInput = nextValue
  notifySearchInputStorageListeners(nextValue)
}

function subscribeToSearchInputStorage(
  listener: SearchInputStorageListener,
): () => void {
  searchInputStorageListeners.add(listener)

  if (typeof window !== 'undefined' && !isStorageListenerAttached) {
    window.addEventListener('storage', handleSearchInputStorageChange)
    isStorageListenerAttached = true
  }

  return () => {
    searchInputStorageListeners.delete(listener)

    if (
      typeof window !== 'undefined'
      && searchInputStorageListeners.size === 0
      && isStorageListenerAttached
    ) {
      window.removeEventListener('storage', handleSearchInputStorageChange)
      isStorageListenerAttached = false
    }
  }
}

export interface UsePersistedSearchInputOptions {
  /**
   * 初始值（可选）
   * 如果提供，将优先使用此值而不是从 localStorage 加载
   */
  initialValue?: string
}

export interface UsePersistedSearchInputReturn {
  /** 当前搜索输入值 */
  value: string
  /** 更新搜索输入值并持久化到 localStorage（支持函数式更新） */
  setValue: (value: SearchInputUpdater) => void
  /** 仅更新状态值，不写入 localStorage（用于从 URL 同步等场景） */
  setValueWithoutPersist: (value: SearchInputUpdater) => void
  /** 清除搜索输入值 */
  clear: () => void
}

const DEFAULT_USE_PERSISTED_SEARCH_INPUT_OPTIONS: UsePersistedSearchInputOptions = {}

/**
 * 管理搜索输入的持久化状态
 *
 * 此 Hook 会：
 * 1. 从 localStorage 加载初始值
 * 2. 在值变化时自动保存到 localStorage
 * 3. 监听 storage 事件以在多个标签页间同步状态
 */
export function usePersistedSearchInput(
  options: UsePersistedSearchInputOptions = DEFAULT_USE_PERSISTED_SEARCH_INPUT_OPTIONS,
): UsePersistedSearchInputReturn {
  const { initialValue } = options

  const [value, setValueState] = useState<string>(() => {
    if (initialValue !== undefined) {
      return initialValue
    }

    return loadSearchInputFromStorage()
  })

  const setValue = useEvent((newValue: SearchInputUpdater) => {
    setValueState((prevValue) => {
      const resolvedValue = typeof newValue === 'function' ? newValue(prevValue) : newValue
      saveSearchInputToStorage(resolvedValue)

      return resolvedValue
    })
  })

  // 仅更新状态值，不写入 localStorage（用于从 URL 同步等场景）
  const setValueWithoutPersist = useEvent((newValue: SearchInputUpdater) => {
    setValueState((prevValue) => {
      return typeof newValue === 'function' ? newValue(prevValue) : newValue
    })
  })

  const clear = useEvent(() => {
    setValueState('')
    clearPersistedSearchInput()
  })

  // 监听 storage 事件以在多个标签页间同步
  useEffect(() => {
    return subscribeToSearchInputStorage(setValueState)
  }, [])

  // 如果提供了 initialValue 且与当前值不同，更新状态
  useEffect(() => {
    if (initialValue !== undefined && initialValue !== value) {
      setValueState(initialValue)
      saveSearchInputToStorage(initialValue)
    }
  }, [initialValue, value])

  return {
    value,
    setValue,
    setValueWithoutPersist,
    clear,
  }
}
