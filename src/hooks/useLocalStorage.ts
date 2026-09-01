import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

/**
 * SSR-safe localStorage-backed state. Always renders `initialValue` on the
 * server and on the first client render (so hydration never mismatches),
 * then reads the real stored value once mounted. `isHydrated` tells callers
 * when the real value has been loaded, so auth-sensitive reads don't act on
 * a still-empty pre-hydration state.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(key)
      // One-time sync from localStorage (an external system) into state right after
      // mount; this is the hydration step the SSR-safe pattern above depends on.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (storedValue !== null) setValue(JSON.parse(storedValue) as T)
    } catch {
      // ignore malformed/inaccessible storage, keep initialValue
    }
    setIsHydrated(true)
  }, [key])

  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, value, isHydrated])

  return [value, setValue, isHydrated]
}
