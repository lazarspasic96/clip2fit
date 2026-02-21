import { createContext, useContext, useEffect, useRef, useState } from 'react'

import type { ApiJob } from '@/types/api'
import type {
  ConversionState,
  ProcessingStage,
} from '@/types/processing'
import { useConvertUrlMutation, useWorkoutQuery } from '@/hooks/use-api'
import { validateWorkoutUrl } from '@/utils/url-validation'
import { apiGet } from '@/utils/api'

const TAG = '[ConversionCtx]'
const JOB_POLL_INTERVAL = 2000

const STATUS_TO_STAGE: Record<string, ProcessingStage> = {
  pending: 'validating',
  downloading: 'downloading',
  transcribing: 'transcribing',
  extracting: 'extracting',
}

const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  validating: 'Validating URL...',
  downloading: 'Downloading audio...',
  transcribing: 'Transcribing with AI...',
  extracting: 'Extracting workout...',
  complete: 'Workout extracted!',
  error: 'Something went wrong',
}

const INITIAL_STATE: ConversionState = {
  jobState: 'idle',
  presentation: 'hidden',
  jobId: null,
  workoutId: null,
  sourceUrl: '',
  platform: 'unknown',
  stage: 'validating',
  progress: 0,
  message: '',
  error: null,
}

interface ConversionContextValue {
  state: ConversionState
  startConversion: (url: string) => Promise<void>
  minimize: () => void
  maximize: () => void
  clear: () => void
  cancelConversion: () => void
}

const ConversionContext = createContext<ConversionContextValue | null>(null)

export const useConversion = (): ConversionContextValue => {
  const ctx = useContext(ConversionContext)
  if (ctx === null) {
    throw new Error('useConversion must be used within ConversionProvider')
  }
  return ctx
}

export const ConversionProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ConversionState>(INITIAL_STATE)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const simulationTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const activeRef = useRef(true)
  const convertMutation = useConvertUrlMutation()

  const { workout } = useWorkoutQuery(state.workoutId)

  // Handle workout loaded → mark completed
  useEffect(() => {
    if (workout === null || state.jobState !== 'processing') return

    setState((prev) => ({
      ...prev,
      jobState: 'completed',
      stage: 'complete',
      progress: 100,
      message: STAGE_MESSAGES.complete,
    }))
  }, [workout, state.jobState])

  const stopPolling = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const clearSimulationTimers = () => {
    for (const timer of simulationTimersRef.current) {
      clearTimeout(timer)
    }
    simulationTimersRef.current = []
  }

  const simulateProcessing = (clonedWorkoutId: string) => {
    clearSimulationTimers()

    const stages: { delay: number; stage: ProcessingStage; progress: number }[] = [
      { delay: 0, stage: 'validating', progress: 10 },
      { delay: 600, stage: 'downloading', progress: 30 },
      { delay: 1800, stage: 'transcribing', progress: 55 },
      { delay: 3000, stage: 'extracting', progress: 80 },
    ]

    for (const { delay, stage, progress } of stages) {
      const timer = setTimeout(() => {
        if (!activeRef.current) return
        setState((prev) => ({
          ...prev,
          stage,
          progress,
          message: STAGE_MESSAGES[stage],
        }))
      }, delay)
      simulationTimersRef.current.push(timer)
    }

    // Final step: set workoutId — triggers useWorkoutQuery → useEffect marks completion
    const finalTimer = setTimeout(() => {
      if (!activeRef.current) return
      setState((prev) => ({ ...prev, workoutId: clonedWorkoutId }))
    }, 4200)
    simulationTimersRef.current.push(finalTimer)
  }

  // Polling effect
  useEffect(() => {
    if (state.jobId === null || state.jobState !== 'processing') {
      stopPolling()
      return
    }

    activeRef.current = true
    const jobId = state.jobId

    const poll = async () => {
      try {
        const job = await apiGet<ApiJob>(`/api/jobs/${jobId}`)
        if (!activeRef.current) return

        console.log(TAG, `poll — status=${job.status} progress=${job.progress}`)

        if (job.status === 'completed' && job.workoutId !== null) {
          stopPolling()
          setState((prev) => ({
            ...prev,
            workoutId: job.workoutId,
            progress: job.progress,
          }))
          return
        }

        if (job.status === 'failed') {
          stopPolling()
          setState((prev) => ({
            ...prev,
            jobState: 'error',
            stage: 'error',
            progress: 0,
            message: job.error ?? 'Conversion failed',
            error: job.error ?? 'Conversion failed',
          }))
          return
        }

        const stage = STATUS_TO_STAGE[job.status]
        if (stage !== undefined) {
          setState((prev) => ({
            ...prev,
            stage,
            progress: job.progress,
            message: STAGE_MESSAGES[stage],
          }))
        }
      } catch {
        if (!activeRef.current) return
        stopPolling()
        setState((prev) => ({
          ...prev,
          jobState: 'error',
          stage: 'error',
          progress: 0,
          message: 'Failed to check job status',
          error: 'Failed to check job status',
        }))
      }
    }

    poll()
    intervalRef.current = setInterval(poll, JOB_POLL_INTERVAL)

    return () => {
      activeRef.current = false
      stopPolling()
    }
  }, [state.jobId, state.jobState])

  const startConversion = async (rawUrl: string) => {
    // Guard: already processing
    if (state.jobState === 'processing') return

    const validation = validateWorkoutUrl(rawUrl)

    if (!validation.isValid) {
      setState({
        ...INITIAL_STATE,
        jobState: 'error',
        presentation: 'fullscreen',
        sourceUrl: rawUrl,
        stage: 'error',
        message: "This platform isn't supported yet",
        error: "This platform isn't supported yet",
      })
      return
    }

    setState({
      ...INITIAL_STATE,
      jobState: 'processing',
      presentation: 'fullscreen',
      sourceUrl: validation.cleanUrl,
      platform: validation.platform,
      stage: 'validating',
      progress: 5,
      message: STAGE_MESSAGES.validating,
    })

    try {
      const response = await convertMutation.mutateAsync(validation.cleanUrl)
      const status = response.status ?? (response.existing === true ? 'existing' : 'processing')

      if (status === 'existing' && response.workoutId !== undefined) {
        setState((prev) => ({
          ...prev,
          jobState: 'existing',
          workoutId: response.workoutId!,
          stage: 'complete',
          progress: 100,
          message: 'Already in your library',
        }))
        return
      }

      if (status === 'cloned' && response.workoutId !== undefined) {
        simulateProcessing(response.workoutId)
        return
      }

      if (response.jobId !== undefined) {
        setState((prev) => ({ ...prev, jobId: response.jobId! }))
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setState((prev) => ({
        ...prev,
        jobState: 'error',
        stage: 'error',
        progress: 0,
        message: 'Failed to start conversion',
        error: errMsg,
      }))
    }
  }

  const minimize = () => {
    setState((prev) => ({ ...prev, presentation: 'minimized' }))
  }

  const maximize = () => {
    setState((prev) => ({ ...prev, presentation: 'fullscreen' }))
  }

  const clear = () => {
    stopPolling()
    clearSimulationTimers()
    setState(INITIAL_STATE)
  }

  const cancelConversion = () => {
    stopPolling()
    clearSimulationTimers()
    setState(INITIAL_STATE)
  }

  // Cleanup simulation timers on unmount
  useEffect(() => {
    return () => {
      clearSimulationTimers()
    }
  }, [])

  return (
    <ConversionContext.Provider
      value={{ state, startConversion, minimize, maximize, clear, cancelConversion }}
    >
      {children}
    </ConversionContext.Provider>
  )
}
