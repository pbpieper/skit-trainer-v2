import { useRef, useState, useCallback, useEffect } from 'react'

export function useDebouncedSave<T>(
  saveFn: (value: T) => Promise<void>,
  delayMs = 1500,
): {
  save: (value: T) => void
  isPending: boolean
  flush: () => Promise<void>
} {
  const [isPending, setIsPending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestValueRef = useRef<T | null>(null)
  const saveFnRef = useRef(saveFn)
  saveFnRef.current = saveFn

  const doSave = useCallback(async () => {
    if (latestValueRef.current === null) return
    const value = latestValueRef.current
    latestValueRef.current = null
    try {
      await saveFnRef.current(value)
    } finally {
      setIsPending(false)
    }
  }, [])

  const save = useCallback((value: T) => {
    latestValueRef.current = value
    setIsPending(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      timerRef.current = null
      doSave()
    }, delayMs)
  }, [delayMs, doSave])

  const flush = useCallback(async () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    await doSave()
  }, [doSave])

  // Cleanup on unmount — flush pending saves
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      // Fire-and-forget the final save
      if (latestValueRef.current !== null) {
        const value = latestValueRef.current
        latestValueRef.current = null
        saveFnRef.current(value).catch(() => {})
      }
    }
  }, [])

  return { save, isPending, flush }
}
