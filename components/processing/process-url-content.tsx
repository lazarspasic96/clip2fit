import { useLocalSearchParams, useRouter } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { useEffect, useRef, useState } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ProcessingStages } from '@/components/processing/processing-stages'
import { UrlInputSection } from '@/components/processing/url-input-section'
import { WorkoutProposal } from '@/components/proposal/workout-proposal'
import { Colors } from '@/constants/colors'
import { useConvertUrlMutation, useJobPolling, useWorkoutQuery } from '@/hooks/use-api'
import type { ProcessingStage, ProcessingState } from '@/types/processing'
import type { SupportedPlatform } from '@/utils/url-validation'
import { validateWorkoutUrl } from '@/utils/url-validation'
import { X } from 'lucide-react-native'

type ScreenState = 'input' | 'processing' | 'preview' | 'error'

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

export const ProcessUrlContent = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams<{ url?: string }>()
  const { shareIntent, resetShareIntent } = useShareIntentContext()

  const [screenState, setScreenState] = useState<ScreenState>('input')
  const [processingState, setProcessingState] = useState<ProcessingState | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const hasStartedRef = useRef(false)
  const sourceRef = useRef<{ url: string; platform: SupportedPlatform }>({ url: '', platform: 'unknown' })

  const convertMutation = useConvertUrlMutation()
  const polling = useJobPolling(jobId)
  const { workout } = useWorkoutQuery(workoutId)

  // React to job polling status changes
  useEffect(() => {
    if (polling.status === null || sourceRef.current.url === '') return

    const { url, platform } = sourceRef.current

    if (polling.status === 'completed' && polling.workoutId !== null) {
      setWorkoutId(polling.workoutId)
      return
    }

    if (polling.status === 'failed') {
      setProcessingState({
        stage: 'error',
        progress: 0,
        message: polling.error ?? 'Conversion failed',
        error: polling.error ?? 'Conversion failed',
        result: null,
        sourceUrl: url,
        platform,
      })
      setScreenState('error')
      return
    }

    const stage = STATUS_TO_STAGE[polling.status]
    if (stage !== undefined) {
      setProcessingState({
        stage,
        progress: polling.progress,
        message: STAGE_MESSAGES[stage],
        error: null,
        result: null,
        sourceUrl: url,
        platform,
      })
    }
  }, [polling.status, polling.progress, polling.workoutId, polling.error])

  // React to workout loaded
  useEffect(() => {
    if (workout === null || sourceRef.current.url === '') return

    setProcessingState({
      stage: 'complete',
      progress: 100,
      message: STAGE_MESSAGES.complete,
      error: null,
      result: workout,
      sourceUrl: sourceRef.current.url,
      platform: sourceRef.current.platform,
    })
    setScreenState('preview')
    resetShareIntent()
  }, [workout, resetShareIntent])

  const startProcessing = async (rawUrl: string) => {
    const validation = validateWorkoutUrl(rawUrl)

    if (!validation.isValid) {
      setProcessingState({
        stage: 'error',
        progress: 0,
        message: "This platform isn't supported yet",
        error: "This platform isn't supported yet",
        result: null,
        sourceUrl: rawUrl,
        platform: 'unknown',
      })
      setScreenState('error')
      return
    }

    sourceRef.current = { url: validation.cleanUrl, platform: validation.platform }

    setProcessingState({
      stage: 'validating',
      progress: 5,
      message: STAGE_MESSAGES.validating,
      error: null,
      result: null,
      sourceUrl: validation.cleanUrl,
      platform: validation.platform,
    })
    setScreenState('processing')

    try {
      const response = await convertMutation.mutateAsync(validation.cleanUrl)

      // Already converted — fetch workout directly
      if (response.existing && response.workoutId !== undefined) {
        setWorkoutId(response.workoutId)
        return
      }

      // Start polling the new job
      if (response.jobId !== undefined) {
        setJobId(response.jobId)
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err)
      setProcessingState({
        stage: 'error',
        progress: 0,
        message: 'Failed to start conversion',
        error: errMsg,
        result: null,
        sourceUrl: validation.cleanUrl,
        platform: validation.platform,
      })
      setScreenState('error')
    }
  }

  // Auto-start processing from share intent or URL param
  useEffect(() => {
    if (hasStartedRef.current) return
    const sharedUrl = shareIntent?.webUrl ?? shareIntent?.text ?? params.url
    if (sharedUrl && screenState === 'input') {
      hasStartedRef.current = true
      startProcessing(sharedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- guarded by hasStartedRef, React Compiler handles memoization
  }, [shareIntent, params.url, screenState])

  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  const handleCancel = () => {
    polling.stop()
    setJobId(null)
    resetShareIntent()
    safeGoBack()
  }

  const handleDismiss = () => {
    resetShareIntent()
    safeGoBack()
  }

  const handleSaved = () => {
    resetShareIntent()
    // Dismiss the fullScreenModal first, then switch to the my-workouts tab.
    // router.replace from a modal doesn't properly change the active tab.
    if (router.canGoBack()) {
      router.back()
    }
    router.navigate(`/(protected)/(tabs)/my-workouts?newWorkoutId=${workoutId}`)
  }

  const handleClose = () => {
    polling.stop()
    setJobId(null)
    resetShareIntent()
    safeGoBack()
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-end px-4 py-3">
        <Pressable onPress={handleClose} hitSlop={12} className="p-1">
          <X size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
      </View>
      {screenState === 'input' && <UrlInputSection onSubmit={startProcessing} />}

      {screenState === 'processing' && processingState !== null && (
        <ProcessingStages state={processingState} onCancel={handleCancel} />
      )}

      {screenState === 'preview' && workoutId !== null && (
        <WorkoutProposal workoutId={workoutId} onSaved={handleSaved} onDiscard={handleDismiss} />
      )}

      {screenState === 'error' && (
        <UrlInputSection
          onSubmit={startProcessing}
          errorMessage={processingState?.error ?? undefined}
          initialUrl={processingState?.sourceUrl}
        />
      )}
    </View>
  )
}
