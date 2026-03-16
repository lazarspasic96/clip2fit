import { useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useSharedValue, withSequence, withTiming } from 'react-native-reanimated'

import { formatTime } from '@/components/workout/shared/format-time'
import { useActiveWorkout } from '@/contexts/active-workout-context'

const computeActiveMs = (
  startedAt: number,
  totalPausedMs: number,
  pausedAt?: number
): number => {
  if (pausedAt !== undefined) {
    return pausedAt - startedAt - totalPausedMs
  }
  return Date.now() - startedAt - totalPausedMs
}

export const useElapsedTimer = () => {
  const { session, isPaused } = useActiveWorkout()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const flashTrigger = useSharedValue(0)

  // Extract primitives to avoid re-creating effects on every session object change
  const startedAt = session?.startedAt ?? 0
  const totalPausedMs = session?.totalPausedMs ?? 0
  const pausedAt = session?.pausedAt
  const hasSession = session !== null

  // Keep a ref for the AppState listener to avoid re-subscribing
  const timerStateRef = useRef({ startedAt, totalPausedMs, pausedAt, hasSession })
  timerStateRef.current = { startedAt, totalPausedMs, pausedAt, hasSession }

  useEffect(() => {
    if (!hasSession) return

    const tick = () => {
      const activeMs = computeActiveMs(startedAt, totalPausedMs, pausedAt)
      setElapsedSeconds(Math.max(0, Math.floor(activeMs / 1000)))
    }

    tick()

    if (isPaused) return

    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [hasSession, startedAt, totalPausedMs, pausedAt, isPaused])

  // Force refresh on app foreground (setInterval stops in iOS background)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const { hasSession: has, startedAt: s, totalPausedMs: t, pausedAt: p } = timerStateRef.current
      if (state === 'active' && has) {
        const activeMs = computeActiveMs(s, t, p)
        setElapsedSeconds(Math.max(0, Math.floor(activeMs / 1000)))
      }
    })
    return () => subscription.remove()
  }, [])

  const triggerFlash = () => {
    flashTrigger.value = withSequence(
      withTiming(1, { duration: 50 }),
      withTiming(0, { duration: 100 })
    )
  }

  return { elapsedSeconds, formatted: formatTime(elapsedSeconds), isPaused, flashTrigger, triggerFlash }
}
