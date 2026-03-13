import { useEffect, useRef, useState } from 'react'
import type { SharedValue } from 'react-native-reanimated'

import type { PoseLandmark } from '@/modules/expo-pose-camera'

const REST_THRESHOLD_MS = 5000
const MOVEMENT_THRESHOLD = 0.015 // normalized coordinate delta
const POLL_INTERVAL_MS = 200

/**
 * Detects rest state by comparing landmark position deltas.
 * No significant movement for >5s → isResting=true.
 */
export const useRestDetection = (
  landmarks: SharedValue<PoseLandmark[]>,
  enabled: boolean,
) => {
  const [isResting, setIsResting] = useState(false)
  const lastPositionsRef = useRef<Record<string, { x: number; y: number }>>({})
  const stillSinceRef = useRef<number>(Date.now())

  useEffect(() => {
    if (!enabled) {
      setIsResting(false)
      stillSinceRef.current = Date.now()
      lastPositionsRef.current = {}
      return
    }

    const interval = setInterval(() => {
      const lm = landmarks.value
      if (lm.length === 0) return

      const prev = lastPositionsRef.current
      let totalDelta = 0
      let count = 0

      for (const point of lm) {
        const last = prev[point.joint]
        if (last !== undefined) {
          totalDelta += Math.abs(point.x - last.x) + Math.abs(point.y - last.y)
          count += 1
        }
      }

      // Update stored positions
      const next: Record<string, { x: number; y: number }> = {}
      for (const point of lm) {
        next[point.joint] = { x: point.x, y: point.y }
      }
      lastPositionsRef.current = next

      if (count === 0) return

      const avgDelta = totalDelta / count
      if (avgDelta > MOVEMENT_THRESHOLD) {
        stillSinceRef.current = Date.now()
        if (isResting) setIsResting(false)
      } else {
        const elapsed = Date.now() - stillSinceRef.current
        if (elapsed >= REST_THRESHOLD_MS && !isResting) {
          setIsResting(true)
        }
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [landmarks, enabled, isResting])

  const resetRest = () => {
    setIsResting(false)
    stillSinceRef.current = Date.now()
  }

  return { isResting, resetRest }
}
