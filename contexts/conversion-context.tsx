import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Alert } from 'react-native'

import type { ApiJob } from '@/types/api'
import type {
  ConversionState,
  ProcessingStage,
} from '@/types/processing'
import { useCancelJobMutation, useConvertUrlMutation, useWorkoutQuery } from '@/hooks/use-api'
import { validateWorkoutUrl } from '@/utils/url-validation'
import { apiGet } from '@/utils/api'

const TAG = '[ConversionCtx]'
const JOB_POLL_INTERVAL = 2000

const STATUS_TO_STAGE: Record<string, ProcessingStage> = {
  pending: 'validating',
  downloading: 'downloading',
  transcribing: 'transcribing',
  extracting: 'extracting',
  fetching_transcript: 'fetchingTranscript',
  analyzing: 'analyzing',
  ocr_extracting: 'ocrExtracting',
  ocr_processing: 'ocrProcessing',
}

const STAGE_MESSAGES: Record<ProcessingStage, string> = {
  validating: 'Checking your video...',
  downloading: 'Getting the good stuff...',
  transcribing: 'Listening to every rep...',
  extracting: 'Building your workout plan...',
  fetchingTranscript: 'Fetching transcript...',
  analyzing: 'Analyzing content...',
  ocrExtracting: 'Reading video frames...',
  ocrProcessing: 'Processing visual content...',
  complete: 'Your workout is ready!',
  error: 'Something went wrong',
}

const STAGE_SUBTITLES: Record<ProcessingStage, string> = {
  validating: 'Making sure everything looks right',
  downloading: 'Pulling the audio from your video',
  transcribing: 'Our AI is picking up every detail',
  extracting: 'Turning words into sets and reps',
  fetchingTranscript: 'Grabbing the words from the video',
  analyzing: 'Our AI is breaking down every move',
  ocrExtracting: 'Scanning the video for on-screen text',
  ocrProcessing: 'Turning visual cues into exercises',
  complete: 'Tap to check it out',
  error: 'Give it another shot',
}

export const getStageSubtitle = (stage: ProcessingStage): string => STAGE_SUBTITLES[stage]

const INITIAL_STATE: ConversionState = {
  jobState: 'idle',
  jobId: null,
  workoutId: null,
  sourceUrl: '',
  platform: 'unknown',
  stage: 'validating',
  progress: 0,
  message: '',
  error: null,
  isCancelling: false,
}

interface ConversionContextValue {
  state: ConversionState
  startConversion: (url: string) => Promise<void>
  clear: () => void
  cancelConversion: () => Promise<boolean>
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
  const cancelMutation = useCancelJobMutation()

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
      { delay: 0, stage: 'validating', progress: 5 },
      { delay: 800, stage: 'downloading', progress: 25 },
      { delay: 2200, stage: 'transcribing', progress: 50 },
      { delay: 3800, stage: 'extracting', progress: 75 },
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

        if (job.status === 'cancelled') {
          stopPolling()
          setState(INITIAL_STATE)
          return
        }

        const stage = STATUS_TO_STAGE[job.status]
        if (stage !== undefined) {
          setState((prev) => ({
            ...prev,
            stage,
            progress: Math.max(prev.progress, job.progress),
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
      sourceUrl: validation.cleanUrl,
      platform: validation.platform,
      stage: 'validating',
      progress: 0,
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

  const clear = () => {
    stopPolling()
    clearSimulationTimers()
    setState(INITIAL_STATE)
  }

  const cancelConversion = async (): Promise<boolean> => {
    const jobIdToCancel = state.jobId

    // No real job (simulation or idle) — just reset
    if (jobIdToCancel === null) {
      activeRef.current = false
      stopPolling()
      clearSimulationTimers()
      setState(INITIAL_STATE)
      return true
    }

    activeRef.current = false
    stopPolling()
    setState((prev) => ({ ...prev, isCancelling: true }))

    try {
      await cancelMutation.mutateAsync(jobIdToCancel)
      setState(INITIAL_STATE)
      return true
    } catch {
      // Network/server error → resume polling
      activeRef.current = true
      setState((prev) => ({ ...prev, isCancelling: false }))
      Alert.alert('Could not cancel', 'Check your connection and try again.')
      return false
    }
  }

  // Cleanup simulation timers on unmount
  useEffect(() => {
    return () => {
      clearSimulationTimers()
    }
  }, [])

  return (
    <ConversionContext.Provider
      value={{
        state,
        startConversion,
        clear,
        cancelConversion,
      }}
    >
      {children}
    </ConversionContext.Provider>
  )
}
