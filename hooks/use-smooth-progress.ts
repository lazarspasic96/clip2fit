import { useEffect, useRef } from 'react'
import {
  Easing,
  cancelAnimation,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import type { ProcessingStage } from '@/types/processing'

const SNAP_DURATION = 800
const COAST_DURATION = 8000
const COMPLETION_DURATION = 600

interface UseSmoothProgressOptions {
  targetProgress: number
  stage: ProcessingStage
}

/**
 * Smoothly animates progress between discrete backend values.
 *
 * 1. Snaps to new target over 800ms (ease-out)
 * 2. After reaching target, coasts toward target + buffer over 8s
 * 3. On completion (100%), snaps in 600ms
 * 4. Never goes backward
 */
export const useSmoothProgress = ({ targetProgress, stage }: UseSmoothProgressOptions) => {
  const smoothProgress = useSharedValue(0)
  const lastTargetRef = useRef(0)

  useEffect(() => {
    const target = Math.max(targetProgress, lastTargetRef.current)
    lastTargetRef.current = target

    cancelAnimation(smoothProgress)

    const isComplete = stage === 'complete' || target >= 100

    if (isComplete) {
      smoothProgress.value = withTiming(100, {
        duration: COMPLETION_DURATION,
        easing: Easing.out(Easing.cubic),
      })
      return
    }

    // Snap to target
    const remaining = 100 - target
    const coastCeiling = target + Math.min(15, remaining * 0.4)

    smoothProgress.value = withTiming(target, {
      duration: SNAP_DURATION,
      easing: Easing.out(Easing.cubic),
    })

    // After snap completes, coast slowly toward ceiling
    const coastTimer = setTimeout(() => {
      smoothProgress.value = withTiming(coastCeiling, {
        duration: COAST_DURATION,
        easing: Easing.linear,
      })
    }, SNAP_DURATION)

    return () => clearTimeout(coastTimer)
  }, [targetProgress, stage, smoothProgress])

  return smoothProgress
}
