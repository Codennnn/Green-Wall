import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'greenwall.searchInput.v1'

function loadSearchInputFromStorage(): string {
  if (typeof window === 'undefined') {
    return ''
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)

    return stored ?? ''
  }
  catch {
    return ''
  }
}

function saveSearchInputToStorage(value: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    if (value) {
      localStorage.setItem(STORAGE_KEY, value)
    }
    else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  catch {
    // 忽略存储错误
  }
}

/**
 * 清除 localStorage 中的搜索输入值
 */
export function clearPersistedSearchInput(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    localStorage.removeItem(STORAGE_KEY)
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
  /** 更新搜索输入值（支持函数式更新） */
  setValue: (value: string | ((prevValue: string) => string)) => void
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
 *
 * @example
 * ```tsx
 * const { value, setValue, clear } = usePersistedSearchInput()
 *
 * <SearchInput
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 */
export function usePersistedSearchInput(
  options: UsePersistedSearchInputOptions = {},
): UsePersistedSearchInputReturn {
  const { initialValue } = options

  // 初始化状态：优先使用 initialValue，否则从 localStorage 加载
  const [value, setValueState] = useState<string>(() => {
    if (initialValue !== undefined) {
      return initialValue
    }

    return loadSearchInputFromStorage()
  })

  // 更新值并保存到 localStorage
  const setValue = useCallback((newValue: string | ((prevValue: string) => string)) => {
    setValueState((prevValue) => {
      const resolvedValue = typeof newValue === 'function' ? newValue(prevValue) : newValue
      saveSearchInputToStorage(resolvedValue)

      return resolvedValue
    })
  }, [])

  // 清除值
  const clear = useCallback(() => {
    setValueState('')
    clearPersistedSearchInput()
  }, [])

  // 监听 storage 事件以在多个标签页间同步
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
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
    clear,
  }
}
