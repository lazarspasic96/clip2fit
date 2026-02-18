import { useLocalSearchParams, useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, {
  FadeInUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/my-workouts/empty-state'
import { WorkoutCard } from '@/components/my-workouts/workout-card'
import { ConfirmationSheet } from '@/components/ui/confirmation-sheet'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'

import { useDeleteWorkoutMutation, useWorkoutsQuery } from '@/hooks/use-api'

const DELETE_ACTION_WIDTH = 80

const DeleteAction = () => (
  <View
    className="items-center justify-center"
    style={{
      width: DELETE_ACTION_WIDTH,
      height: '100%',
      backgroundColor: '#dc2626',
      borderTopRightRadius: 16,
      borderBottomRightRadius: 16,
    }}
  >
    <Trash2 size={20} color="#fff" pointerEvents="none" />
    <Text className="text-xs font-inter-semibold text-white mt-1">Delete</Text>
  </View>
)

const NewWorkoutHighlight = ({ children }: { children: React.ReactNode }) => {
  const borderOpacity = useSharedValue(1)

  useEffect(() => {
    borderOpacity.value = withSequence(
      withTiming(0.3, { duration: 500 }),
      withTiming(1, { duration: 500 }),
      withTiming(0.3, { duration: 500 }),
      withTiming(1, { duration: 500 }),
      withTiming(0.3, { duration: 500 }),
      withTiming(0, { duration: 1000 }),
    )
  }, [borderOpacity])

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: 2,
    borderColor: Colors.brand.accent,
    borderRadius: 16,
    opacity: borderOpacity.value,
  }))

  return (
    <View>
      {children}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            pointerEvents: 'none',
          },
          animatedStyle,
        ]}
      />
    </View>
  )
}

const MyWorkoutsScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { newWorkoutId } = useLocalSearchParams<{ newWorkoutId?: string }>()
  const { workouts, isLoading, isRefetching, refetch } = useWorkoutsQuery()
  const deleteMutation = useDeleteWorkoutMutation()

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const mountedRef = useRef(true)
  const newWorkoutIdRef = useRef(newWorkoutId)

  // Clear URL param after 4s so highlight doesn't persist on tab revisit
  useEffect(() => {
    if (newWorkoutId === undefined) return
    newWorkoutIdRef.current = newWorkoutId
    const timer = setTimeout(() => {
      newWorkoutIdRef.current = undefined
      router.replace('/(protected)/(tabs)/my-workouts')
    }, 4000)
    return () => clearTimeout(timer)
  }, [newWorkoutId, router])

  const handleDeleteConfirm = () => {
    if (deleteTargetId === null) return
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteTargetId(null)
      },
    })
  }

  const deleteTarget = deleteTargetId !== null ? (workouts.find((w) => w.id === deleteTargetId) ?? null) : null

  const deleteTitle = deleteTarget?.isPersonalCopy ? 'Delete workout?' : 'Remove from library?'

  const deleteDescription = deleteTarget?.isPersonalCopy
    ? 'This will permanently delete your personal copy. This cannot be undone.'
    : 'This workout will be removed from your library. You can add it back by converting the same video.'

  const deleteError =
    deleteMutation.error !== null
      ? deleteMutation.error instanceof Error
        ? deleteMutation.error.message
        : 'Failed to delete'
      : null

  if (isLoading && workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary px-5" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-5 pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">My Schedule</Text>
      </View>
      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => {
            const isNew = item.id === newWorkoutIdRef.current
            const entering = isNew
              ? FadeInUp.duration(600).springify()
              : mountedRef.current
                ? FadeInUp.delay(index * 40).springify()
                : undefined

            const card = (
              <SwipeableRow
                actionWidth={DELETE_ACTION_WIDTH}
                actionContent={<DeleteAction />}
                onAction={() => setDeleteTargetId(item.id)}
              >
                <Pressable onPress={() => router.push(`/(protected)/workout-detail?id=${item.id}`)}>
                  <WorkoutCard workout={item} />
                </Pressable>
              </SwipeableRow>
            )

            return (
              <Animated.View entering={entering} layout={LinearTransition.springify()} className="mx-5">
                {isNew ? <NewWorkoutHighlight>{card}</NewWorkoutHighlight> : card}
              </Animated.View>
            )
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.content.secondary} />
          }
        />
      )}

      <ConfirmationSheet
        visible={deleteTargetId !== null}
        title={deleteTitle}
        description={deleteDescription}
        confirmLabel={deleteTarget?.isPersonalCopy ? 'Delete' : 'Remove'}
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
        error={deleteError}
      />
    </View>
  )
}

export default MyWorkoutsScreen
