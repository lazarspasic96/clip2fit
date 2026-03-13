import { useEffect, useRef, useState } from 'react'
import type { SharedValue } from 'react-native-reanimated'

import type { PoseLandmark } from '@/modules/expo-pose-camera'

const BODY_LOST_DELAY_MS = 1000

/**
 * Debounces empty landmark arrays — returns bodyDetected=false
 * only after landmarks have been empty for >1s.
 */
export const useBodyDetection = (landmarks: SharedValue<PoseLandmark[]>) => {
  const [bodyDetected, setBodyDetected] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastHadBodyRef = useRef(false)

  useEffect(() => {
    // Poll the shared value on JS thread at ~15Hz
    const interval = setInterval(() => {
      const lm = landmarks.value
      const hasBody = lm.length > 0

      if (hasBody && !lastHadBodyRef.current) {
        // Body appeared — clear any pending "lost" timer
        if (timerRef.current !== null) {
          clearTimeout(timerRef.current)
          timerRef.current = null
        }
        setBodyDetected(true)
        lastHadBodyRef.current = true
      } else if (!hasBody && lastHadBodyRef.current) {
        // Body just disappeared — start debounce timer
        lastHadBodyRef.current = false
        timerRef.current = setTimeout(() => {
          setBodyDetected(false)
          timerRef.current = null
        }, BODY_LOST_DELAY_MS)
      }
    }, 66) // ~15Hz

    return () => {
      clearInterval(interval)
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
      }
    }
  }, [landmarks])

  return { bodyDetected }
}
