import { useEffect, useRef, useState } from 'react'
import type { SharedValue } from 'react-native-reanimated'

import { SETUP_CONFIDENCE_THRESHOLD, REQUIRED_JOINTS_DEFAULT } from '@/constants/pose-skeleton'
import type { PoseLandmark } from '@/modules/expo-pose-camera'
import type { FormCoachScreenState } from '@/types/form-rules'
import type { FormRuleConfig } from '@/types/form-rules'

const SETUP_HOLD_MS = 2000 // body must be positioned for 2s to confirm
const SETUP_POLL_MS = 100

type UseFormCoachStateOptions = {
  landmarks: SharedValue<PoseLandmark[]>
  isResting: boolean
  bodyDetected: boolean
  formRules: FormRuleConfig | null
}

export const useFormCoachState = ({
  landmarks,
  isResting,
  bodyDetected,
  formRules,
}: UseFormCoachStateOptions) => {
  const [screenState, setScreenState] = useState<FormCoachScreenState>('setup')
  const setupStartRef = useRef<number | null>(null)
  const [setupProgress, setSetupProgress] = useState(0) // 0-1 for countdown
  const [jointChecklist, setJointChecklist] = useState<Record<string, boolean>>({})

  const requiredJoints = formRules?.requiredJoints ?? REQUIRED_JOINTS_DEFAULT

  // Setup → Active transition: check required joints have high confidence for 2s
  useEffect(() => {
    if (screenState !== 'setup') return

    const interval = setInterval(() => {
      const lm = landmarks.value
      const jointMap = new Map<string, number>()
      for (const point of lm) {
        jointMap.set(point.joint, point.confidence)
      }

      // Build checklist
      const checklist: Record<string, boolean> = {}
      let allReady = true
      for (const joint of requiredJoints) {
        const conf = jointMap.get(joint) ?? 0
        const ready = conf >= SETUP_CONFIDENCE_THRESHOLD
        checklist[joint] = ready
        if (!ready) allReady = false
      }
      setJointChecklist(checklist)

      if (allReady) {
        if (setupStartRef.current === null) {
          setupStartRef.current = Date.now()
        }
        const elapsed = Date.now() - setupStartRef.current
        setSetupProgress(Math.min(elapsed / SETUP_HOLD_MS, 1))

        if (elapsed >= SETUP_HOLD_MS) {
          setScreenState('active')
          setSetupProgress(0)
          setupStartRef.current = null
        }
      } else {
        setupStartRef.current = null
        setSetupProgress(0)
      }
    }, SETUP_POLL_MS)

    return () => clearInterval(interval)
  }, [screenState, landmarks, requiredJoints])

  // Active ↔ Rest transitions
  useEffect(() => {
    if (screenState === 'active' && isResting) {
      setScreenState('rest')
    } else if (screenState === 'rest' && !isResting && bodyDetected) {
      setScreenState('active')
    }
  }, [screenState, isResting, bodyDetected])

  const goToSummary = () => setScreenState('summary')
  const resetToSetup = () => {
    setScreenState('setup')
    setSetupProgress(0)
    setupStartRef.current = null
    setJointChecklist({})
  }

  return {
    screenState,
    setupProgress,
    jointChecklist,
    goToSummary,
    resetToSetup,
  }
}
