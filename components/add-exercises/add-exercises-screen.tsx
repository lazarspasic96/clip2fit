import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router'
import { useCallback, useEffect, useRef } from 'react'
import { Alert, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { CatalogFloatingCta } from '@/components/catalog/catalog-floating-cta'
import { DesignBStackedFocus } from '@/components/add-exercises/designs/design-b-stacked-focus'
import { useAddExercisesController } from '@/components/add-exercises/shared/use-add-exercises-controller'
import { BackButton } from '@/components/ui/back-button'
import { useAddExercisesFlow } from '@/hooks/use-add-exercises-flow'

const CTA_HEIGHT = 108

export const AddExercisesScreen = () => {
  const params = useLocalSearchParams<{ requestId?: string }>()
  const requestId = params.requestId ?? ''

  const router = useRouter()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const flow = useAddExercisesFlow()

  const request = requestId.length > 0 ? flow.getAddExercisesRequest(requestId) : null
  const controller = useAddExercisesController(request)

  const allowExitRef = useRef(false)

  const closeWithDiscard = useCallback((action?: unknown) => {
    controller.clearSelection()
    if (requestId.length > 0) {
      flow.cancelAddExercisesFlow(requestId)
    }

    allowExitRef.current = true
    if (action !== undefined) {
      navigation.dispatch(action as never)
      return
    }

    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace('/(protected)/(tabs)/my-workouts' as never)
    }
  }, [controller, flow, navigation, requestId, router])

  const requestClose = useCallback((action?: unknown) => {
    if (!controller.hasSelection) {
      closeWithDiscard(action)
      return
    }

    Alert.alert(
      'Discard selected exercises?',
      'Your selected exercises have not been added yet.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => closeWithDiscard(action),
        },
      ],
    )
  }, [closeWithDiscard, controller.hasSelection])

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowExitRef.current || !controller.hasSelection) return
      event.preventDefault()
      requestClose(event.data.action)
    })

    return unsubscribe
  }, [controller.hasSelection, navigation, requestClose])

  const handleAdd = () => {
    if (requestId.length === 0) return
    const selected = controller.getSelected()
    flow.submitAddExercisesResult(requestId, selected)
    allowExitRef.current = true
    router.back()
  }

  if (request === null) {
    return (
      <View className="flex-1 bg-background-primary items-center justify-center px-6">
        <Text className="text-lg font-inter-semibold text-content-primary text-center">Add request expired</Text>
        <Text className="text-sm font-inter text-content-secondary text-center mt-1">
          Please reopen Add Exercises from your workout screen.
        </Text>
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back()
            } else {
              router.replace('/(protected)/(tabs)/my-workouts' as never)
            }
          }}
          className="mt-4 px-4 py-2 rounded-xl border border-border-primary"
        >
          <Text className="text-sm font-inter-semibold text-content-primary">Close</Text>
        </Pressable>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-3 flex-row items-center">
        <BackButton onPress={() => requestClose()} />
        <View className="flex-1 items-center">
          <Text className="text-base font-inter-semibold text-content-primary">Add Exercises</Text>
          <Text className="text-xs font-inter text-content-secondary mt-0.5">
            {request.caller === 'workout-detail' ? 'Workout Details' : 'Workout Proposal'}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      <DesignBStackedFocus
        controller={controller}
        bottomInset={CTA_HEIGHT}
        onOpenFilters={() => router.push('/(protected)/sheets/picker-filters' as never)}
      />

      <CatalogFloatingCta selectedCount={controller.selectedCount} label="Add to Workout" onPress={handleAdd} />
    </View>
  )
}
