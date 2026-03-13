import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { runOnUI, type SharedValue, useSharedValue } from 'react-native-reanimated'

import { getFormRules } from '@/constants/form-rules'
import { CONFIDENCE_THRESHOLD } from '@/constants/pose-skeleton'
import type { PoseLandmark } from '@/modules/expo-pose-camera'
import { formSessionStore } from '@/stores/form-session-store'
import type { CameraAngle, FormCoachScreenState, FormIssue, FormSeverity } from '@/types/form-rules'
import { detectCameraAngle } from '@/utils/camera-angle-detector'
import { evaluateForm, getIssueJointNames } from '@/utils/form-evaluator'
import { calculateAngle } from '@/utils/pose-angles'
import { createBarbellTracker } from '@/utils/barbell-tracker'
import { createRepCounter } from '@/utils/rep-counter'

import { useBodyDetection } from './use-body-detection'
import { useFormCoaching } from './use-form-coaching'
import { useFormCoachState } from './use-form-coach-state'
import { useRestDetection } from './use-rest-detection'
import { useTtsFeedback } from './use-tts-feedback'

type UseFormCoachOrchestratorOptions = {
  landmarks: SharedValue<PoseLandmark[]>
  selectedExercise: string | null
}

export const useFormCoachOrchestrator = ({
  landmarks,
  selectedExercise,
}: UseFormCoachOrchestratorOptions) => {
  const formRules = selectedExercise !== null ? getFormRules(selectedExercise) : null

  // Detection hooks
  const { bodyDetected } = useBodyDetection(landmarks)
  const { isResting, resetRest } = useRestDetection(landmarks, bodyDetected)

  // State machine
  const { screenState, setupProgress, jointChecklist, goToSummary, resetToSetup } =
    useFormCoachState({ landmarks, isResting, bodyDetected, formRules })

  // Form feedback
  const [formIssues, setFormIssues] = useState<FormIssue[]>([])
  const [skippedChecks, setSkippedChecks] = useState<string[]>([])
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>('side')
  const [debugAngles, setDebugAngles] = useState<Record<string, number>>({})
  const issueJointsSharedValue = useSharedValue<string[]>([])

  // Camera angle toast (one-time per session)
  const [showAngleToast, setShowAngleToast] = useState(false)
  const angleToastShownRef = useRef(false)

  // Rep counting
  const repCounterRef = useRef(
    formRules?.repCountThresholds !== undefined
      ? createRepCounter(formRules.repCountThresholds)
      : null,
  )
  const [repCount, setRepCount] = useState(0)
  const [showSetSummary, setShowSetSummary] = useState(false)

  // Barbell tracking
  const barbellTrackerRef = useRef(createBarbellTracker())
  const [barbellPath, setBarbellPath] = useState<{ x: number; y: number }[]>([])
  const [barbellDrifting, setBarbellDrifting] = useState(false)
  const isBarbell = formRules?.equipment === 'barbell'

  // Bar speed
  const [lastConcentricMs, setLastConcentricMs] = useState<number | null>(null)

  // TTS
  const { isMuted, toggleMute, speakIssue, speakMessage, speakRepFeedback } = useTtsFeedback()

  // LLM coaching (mock)
  const { coachingMessage, spokenCoachingMessage } = useFormCoaching({
    enabled: screenState === 'active' && formRules !== null,
    exerciseName: selectedExercise ?? '',
    issues: formIssues,
    debugAngles,
    cameraAngle,
    repCount,
    setCount: formSessionStore.getSession()?.sets.length ?? 0,
    skippedChecks,
  })

  // Speak coaching messages via TTS (use spoken version, not display version)
  useEffect(() => {
    if (spokenCoachingMessage !== null) {
      speakMessage(spokenCoachingMessage)
    }
  }, [spokenCoachingMessage, speakMessage])

  // Session store
  const sessionVersion = useSyncExternalStore(
    formSessionStore.subscribe,
    formSessionStore.getSnapshot,
  )

  // Initialize rep counter when rules change
  useEffect(() => {
    if (formRules?.repCountThresholds !== undefined) {
      repCounterRef.current = createRepCounter(formRules.repCountThresholds)
    } else {
      repCounterRef.current = null
    }
    setRepCount(0)
  }, [formRules])

  // Start session when entering active state with an exercise
  useEffect(() => {
    if (screenState === 'active' && selectedExercise !== null) {
      const session = formSessionStore.getSession()
      if (session === null || session.exerciseName !== selectedExercise) {
        formSessionStore.startExercise(selectedExercise)
      }
    }
  }, [screenState, selectedExercise])

  // Show camera angle toast when transitioning to active with front camera
  useEffect(() => {
    if (screenState === 'active' && cameraAngle === 'front' && !angleToastShownRef.current) {
      angleToastShownRef.current = true
      setShowAngleToast(true)
    }
  }, [screenState, cameraAngle])

  // Finalize session when going to summary
  useEffect(() => {
    if (screenState === 'summary') {
      formSessionStore.finalizeSession()
    }
  }, [screenState])

  // Finish set on rest
  useEffect(() => {
    if (screenState === 'rest') {
      const currentReps = formSessionStore.getCurrentSetReps()
      if (currentReps > 0) {
        formSessionStore.finishSet()
        setShowSetSummary(true)
      }
    }
  }, [screenState])

  // Debug log throttle ref
  const lastDebugLogRef = useRef(0)

  // Form evaluation + rep counting loop
  const evalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (screenState !== 'active' || formRules === null) {
      setFormIssues([])
      setSkippedChecks([])
      if (evalIntervalRef.current !== null) {
        clearInterval(evalIntervalRef.current)
        evalIntervalRef.current = null
      }
      runOnUI(() => {
        'worklet'
        issueJointsSharedValue.value = []
      })()
      return
    }

    evalIntervalRef.current = setInterval(() => {
      const lm = landmarks.value
      if (lm.length === 0) return

      const jointMap: Record<string, { x: number; y: number; confidence: number }> = {}
      for (const point of lm) {
        if (point.confidence > CONFIDENCE_THRESHOLD) {
          jointMap[point.joint] = { x: point.x, y: point.y, confidence: point.confidence }
        }
      }

      const angle = detectCameraAngle(jointMap)
      setCameraAngle(angle)

      const { issues, skippedChecks: skipped, evaluatedRules } = evaluateForm(jointMap, angle, formRules)
      setFormIssues(issues)
      setSkippedChecks(skipped)

      // Record form sample for summary (no re-render)
      formSessionStore.recordFormSample(issues, evaluatedRules)

      const issueJoints = getIssueJointNames(issues)
      runOnUI(() => {
        'worklet'
        issueJointsSharedValue.value = issueJoints
      })()

      if (issues.length > 0) {
        speakIssue(issues[0])
      }

      // Rep counting via primary angle
      if (repCounterRef.current !== null && formRules.repCountJoints !== undefined) {
        const [jA, jB, jC] = formRules.repCountJoints
        const a = jointMap[jA]
        const b = jointMap[jB]
        const c = jointMap[jC]
        if (a !== undefined && b !== undefined && c !== undefined) {
          const primaryAngle = calculateAngle(a, b, c)
          const { counted, concentricMs } = repCounterRef.current.addFrame(primaryAngle)
          if (counted) {
            setRepCount(repCounterRef.current.getRepCount())
            formSessionStore.recordRep(issues)
            if (concentricMs !== null) {
              setLastConcentricMs(concentricMs)
            }
            // Rep-boundary voice feedback
            const worstSeverity: FormSeverity =
              issues.some((i) => i.severity === 'error') ? 'error'
              : issues.some((i) => i.severity === 'warning') ? 'warning'
              : 'good'
            speakRepFeedback(worstSeverity)
          }
        }
      }

      // Barbell path tracking
      if (isBarbell) {
        const result = barbellTrackerRef.current.addFrame(jointMap)
        if (result !== null) {
          setBarbellPath(result.path)
          setBarbellDrifting(result.isDrifting)
          if (result.isDrifting) {
            const driftIssue: FormIssue = {
              joint: 'leftWrist',
              severity: 'warning',
              message: `Bar drifting ${result.driftDirection}`,
              spokenMessage: `Bar is drifting ${result.driftDirection}`,
            }
            // Add drift to issues without mutating existing array
            setFormIssues((prev) => [...prev, driftIssue])
          }
        }
      }

      // Compute angles for dashboard (always, not just __DEV__)
      const angles: Record<string, number> = {}
      for (const rule of formRules.angleRules) {
        if (!rule.applicableAngles.includes(angle)) continue
        const [jA, jB, jC] = rule.joints
        const a = jointMap[jA]
        const b = jointMap[jB]
        const c = jointMap[jC]
        if (a !== undefined && b !== undefined && c !== undefined) {
          angles[rule.name] = calculateAngle(a, b, c)
        }
      }
      setDebugAngles(angles)

      // Throttled debug log (~1/sec, dev only)
      if (__DEV__) {
        const now = Date.now()
        if (now - lastDebugLogRef.current > 1000) {
          lastDebugLogRef.current = now
          const angleStr = Object.entries(angles)
            .map(([name, val]) => `${name}: ${Math.round(val)}°`)
            .join(', ')
          console.log(`[FormCoach] camera: ${angle}, ${angleStr}`)
        }
      }
    }, 66)

    return () => {
      if (evalIntervalRef.current !== null) {
        clearInterval(evalIntervalRef.current)
        evalIntervalRef.current = null
      }
    }
  }, [screenState, formRules, landmarks, issueJointsSharedValue, speakIssue])

  const handleExerciseSwitch = (exercise: string) => {
    if (selectedExercise !== null) {
      formSessionStore.switchExercise(exercise)
    }
    setFormIssues([])
    setSkippedChecks([])
    setRepCount(0)
    setLastConcentricMs(null)
    repCounterRef.current?.reset()
    barbellTrackerRef.current.reset()
    setBarbellPath([])
    setBarbellDrifting(false)
    angleToastShownRef.current = false
    setShowAngleToast(false)
    resetToSetup()
    resetRest()
  }

  const dismissSetSummary = () => setShowSetSummary(false)
  const dismissAngleToast = () => setShowAngleToast(false)

  return {
    // State
    screenState,
    bodyDetected,
    setupProgress,
    jointChecklist,
    formRules,
    formIssues,
    skippedChecks,
    cameraAngle,
    debugAngles,
    issueJointsSharedValue,
    // Rep counting
    repCount,
    lastConcentricMs,
    showSetSummary,
    dismissSetSummary,
    sessionVersion,
    setNumber: formSessionStore.getSession()?.sets.length ?? 0,
    // Barbell
    barbellPath,
    barbellDrifting,
    isBarbell,
    // TTS
    isMuted,
    toggleMute,
    // Coaching
    coachingMessage,
    // Camera angle toast
    showAngleToast,
    dismissAngleToast,
    // Actions
    goToSummary,
    resetToSetup,
    handleExerciseSwitch,
  }
}
