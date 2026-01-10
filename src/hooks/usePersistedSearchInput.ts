import { useEffect, useState } from 'react'
import { useEvent } from 'react-use-event-hook'

import { StorageKeys } from '~/constants'

function loadSearchInputFromStorage(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const stored = localStorage.getItem(StorageKeys.SearchInput)

    return stored ?? ''
  }
  catch {
    return ''
  }
}

export function saveSearchInputToStorage(value: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value) {
      localStorage.setItem(StorageKeys.SearchInput, value)
    }
    else {
      localStorage.removeItem(StorageKeys.SearchInput)
    }
  }
  catch {
    // 忽略存储错误
  }
}

export function clearPersistedSearchInput(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(StorageKeys.SearchInput)
  }
  catch {
    // 忽略存储错误
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
  setValue: (value: string | ((prevValue: string) => string)) => void
  /** 仅更新状态值，不写入 localStorage（用于从 URL 同步等场景） */
  setValueWithoutPersist: (value: string | ((prevValue: string) => string)) => void
  /** 清除搜索输入值 */
  clear: () => void
}

/**
 * 管理搜索输入的持久化状态
 *
 * 此 Hook 会：
 * 1. 从 localStorage 加载初始值
 * 2. 在值变化时自动保存到 localStorage
 * 3. 监听 storage 事件以在多个标签页间同步状态
 */
export function usePersistedSearchInput(
  options: UsePersistedSearchInputOptions = {},
): UsePersistedSearchInputReturn {
  const { initialValue } = options

  const [value, setValueState] = useState<string>(() => {
    if (initialValue !== undefined) {
      return initialValue
    }

    return loadSearchInputFromStorage()
  })

  const setValue = useEvent((newValue: string | ((prevValue: string) => string)) => {
    setValueState((prevValue) => {
      const resolvedValue = typeof newValue === 'function' ? newValue(prevValue) : newValue
      saveSearchInputToStorage(resolvedValue)

      return resolvedValue
    })
  })

  // 仅更新状态值，不写入 localStorage（用于从 URL 同步等场景）
  const setValueWithoutPersist = useEvent((newValue: string | ((prevValue: string) => string)) => {
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
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === StorageKeys.SearchInput) {
        setValueState(event.newValue ?? '')
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
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
