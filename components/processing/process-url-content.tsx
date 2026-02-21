import { useLocalSearchParams, useRouter } from 'expo-router'
import { useShareIntentContext } from 'expo-share-intent'
import { useEffect, useRef } from 'react'
import { Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Minimize2, X } from 'lucide-react-native'

import { AlreadyConvertedView } from '@/components/processing/already-converted-view'
import { ProcessingStages } from '@/components/processing/processing-stages'
import { UrlInputSection } from '@/components/processing/url-input-section'
import { WorkoutProposal } from '@/components/proposal/workout-proposal'
import { Colors } from '@/constants/colors'
import { useConversion } from '@/contexts/conversion-context'

export const ProcessUrlContent = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const params = useLocalSearchParams<{ url?: string }>()
  const { shareIntent, resetShareIntent } = useShareIntentContext()
  const { state, startConversion, minimize, cancelConversion, clear } = useConversion()
  const hasStartedRef = useRef(false)

  // Auto-start from share intent or URL param
  useEffect(() => {
    if (hasStartedRef.current) return
    const sharedUrl = shareIntent?.webUrl ?? shareIntent?.text ?? params.url
    if (sharedUrl !== undefined && sharedUrl !== null && state.jobState === 'idle') {
      hasStartedRef.current = true
      startConversion(sharedUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- guarded by hasStartedRef
  }, [shareIntent, params.url, state.jobState])

  const safeGoBack = () => {
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/')
    }
  }

  const handleMinimize = () => {
    minimize()
    safeGoBack()
  }

  const handleCancel = () => {
    cancelConversion()
    resetShareIntent()
    safeGoBack()
  }

  const handleClose = () => {
    if (state.jobState === 'processing') {
      cancelConversion()
    } else {
      clear()
    }
    resetShareIntent()
    safeGoBack()
  }

  const handleSaved = () => {
    const savedWorkoutId = state.workoutId
    clear()
    resetShareIntent()
    if (router.canGoBack()) {
      router.back()
    }
    router.navigate(`/(protected)/(tabs)/my-workouts?newWorkoutId=${savedWorkoutId}`)
  }

  const handleDiscard = () => {
    clear()
    resetShareIntent()
    safeGoBack()
  }

  const handleViewExisting = () => {
    const existingWorkoutId = state.workoutId
    clear()
    resetShareIntent()
    if (router.canGoBack()) {
      router.back()
    }
    router.navigate(`/(protected)/(tabs)/my-workouts?newWorkoutId=${existingWorkoutId}`)
  }

  const handleGoBackToIdle = () => {
    clear()
  }

  const isProcessing = state.jobState === 'processing'

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-end px-4 py-3 gap-3">
        {isProcessing && (
          <Pressable onPress={handleMinimize} hitSlop={12} className="p-1">
            <Minimize2 size={22} color={Colors.content.primary} pointerEvents="none" />
          </Pressable>
        )}
        <Pressable onPress={handleClose} hitSlop={12} className="p-1">
          <X size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
      </View>

      {state.jobState === 'idle' && <UrlInputSection onSubmit={startConversion} />}

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
          onCancel={handleCancel}
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

      {state.jobState === 'completed' && state.workoutId !== null && (
        <WorkoutProposal
          workoutId={state.workoutId}
          onSaved={handleSaved}
          onDiscard={handleDiscard}
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
