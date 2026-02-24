import { useEffect, useRef } from 'react'
import { View } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'

import { AlreadyConvertedView } from '@/components/processing/already-converted-view'
import { ProcessUrlHeader } from '@/components/processing/process-url-header'
import { ProcessingStages } from '@/components/processing/processing-stages'
import { UrlInputSection } from '@/components/processing/url-input-section'
import { useConversion } from '@/contexts/conversion-context'

const dismiss = (router: ReturnType<typeof useRouter>) => {
  if (router.canDismiss()) {
    router.dismiss()
  } else {
    router.back()
  }
}

export const ProcessUrlContent = () => {
  const router = useRouter()
  const params = useLocalSearchParams<{ url?: string }>()
  const { state, startConversion, cancelConversion, clear } = useConversion()
  const autoStarted = useRef(false)

  // Auto-start conversion if opened with a url param (share intent or deep link)
  useEffect(() => {
    if (params.url !== undefined && params.url.length > 0 && !autoStarted.current && state.jobState === 'idle') {
      autoStarted.current = true
      startConversion(params.url)
    }
  }, [params.url, state.jobState, startConversion])

  const handleMinimize = () => {
    dismiss(router)
  }

  const handleClose = () => {
    clear()
    dismiss(router)
  }

  const handleCancelWithConfirm = () => {
    cancelConversion()
    dismiss(router)
  }

  // Auto-navigate to full-screen proposal when conversion completes
  useEffect(() => {
    if (state.jobState === 'completed' && state.workoutId !== null) {
      dismiss(router)
      router.push(`/(protected)/workout-proposal?workoutId=${state.workoutId}`)
    }
  }, [state.jobState, state.workoutId, router])

  const handleViewExisting = () => {
    const existingWorkoutId = state.workoutId
    clear()
    dismiss(router)
    router.navigate(`/(protected)/(tabs)/my-workouts?newWorkoutId=${existingWorkoutId}`)
  }

  const handleGoBackToIdle = () => {
    clear()
  }

  return (
    <View className="flex-1 bg-background-primary">
      <ProcessUrlHeader
        jobState={state.jobState}
        onMinimize={handleMinimize}
        onClose={handleClose}
        onCancelWithConfirm={handleCancelWithConfirm}
      />

      {state.jobState === 'idle' && (
        <UrlInputSection onSubmit={startConversion} />
      )}

      {state.jobState === 'processing' && (
        <ProcessingStages
          state={{
            stage: state.stage,
            progress: state.progress,
            message: state.message,
            error: state.error,
            result: null,
            sourceUrl: state.sourceUrl,
            platform: state.platform,
          }}
        />
      )}

      {state.jobState === 'existing' && state.workoutId !== null && (
        <AlreadyConvertedView
          platform={state.platform}
          sourceUrl={state.sourceUrl}
          onViewInLibrary={handleViewExisting}
          onGoBack={handleGoBackToIdle}
        />
      )}

      {state.jobState === 'error' && (
        <UrlInputSection
          onSubmit={startConversion}
          errorMessage={state.error ?? undefined}
          initialUrl={state.sourceUrl}
        />
      )}
    </View>
  )
}
