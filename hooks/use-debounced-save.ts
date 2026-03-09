import { useEffect, useRef } from 'react'

const DEFAULT_DELAY = 800

export const useDebouncedSave = <T>(callback: (payload: T) => void, delay = DEFAULT_DELAY) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestPayload = useRef<T | null>(null)
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const cancel = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const flush = () => {
    cancel()
    if (latestPayload.current !== null) {
      callbackRef.current(latestPayload.current)
      latestPayload.current = null
    }
  }

  const schedule = (payload: T) => {
    latestPayload.current = payload
    cancel()
    timerRef.current = setTimeout(flush, delay)
  }

  useEffect(() => {
    return () => flush()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- flush is ref-based, stable across renders
  }, [])

  return { schedule, flush, cancel }
}
