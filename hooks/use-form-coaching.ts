import { useEffect, useRef, useState } from 'react'

import type { CameraAngle, FormIssue } from '@/types/form-rules'
import { createFormDataAggregator } from '@/utils/form-data-aggregator'
import { getMockCoachingMessage, resetCoachingState } from '@/utils/form-coaching-mock'

const COACHING_INTERVAL_MS = 8000

type UseFormCoachingOptions = {
  enabled: boolean
  exerciseName: string
  issues: FormIssue[]
  debugAngles: Record<string, number>
  cameraAngle: CameraAngle
  repCount: number
  setCount: number
  skippedChecks: string[]
}

export const useFormCoaching = ({
  enabled,
  exerciseName,
  issues,
  debugAngles,
  cameraAngle,
  repCount,
  setCount,
  skippedChecks,
}: UseFormCoachingOptions) => {
  const [coachingMessage, setCoachingMessage] = useState<string | null>(null)
  const [spokenCoachingMessage, setSpokenCoachingMessage] = useState<string | null>(null)
  const aggregatorRef = useRef(createFormDataAggregator())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Feed frames into aggregator
  useEffect(() => {
    if (!enabled) return

    aggregatorRef.current.addFrame({
      issues,
      angles: debugAngles,
      cameraAngle,
      repCount,
      setCount,
      exerciseName,
      skippedChecks,
    })
  }, [enabled, issues, debugAngles, cameraAngle, repCount, setCount, exerciseName, skippedChecks])

  // Periodically generate coaching message
  useEffect(() => {
    if (!enabled) {
      setCoachingMessage(null)
      setSpokenCoachingMessage(null)
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const summary = aggregatorRef.current.getSummary()
      const { displayMessage, spokenMessage } = getMockCoachingMessage(summary)
      setCoachingMessage(displayMessage)
      setSpokenCoachingMessage(spokenMessage)

      // Auto-dismiss after 3s
      setTimeout(() => {
        setCoachingMessage(null)
        setSpokenCoachingMessage(null)
      }, COACHING_INTERVAL_MS)
    }, COACHING_INTERVAL_MS)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled])

  // Reset on exercise change
  useEffect(() => {
    aggregatorRef.current.reset()
    resetCoachingState()
    setCoachingMessage(null)
    setSpokenCoachingMessage(null)
  }, [exerciseName])

  return { coachingMessage, spokenCoachingMessage }
}
