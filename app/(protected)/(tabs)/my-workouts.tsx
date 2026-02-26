import { useLocalSearchParams, useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
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
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import { TAB_CONTENT_BOTTOM_CLEARANCE } from '@/constants/tab-bar'

import { useDeleteWorkoutMutation, useWorkoutsQuery } from '@/hooks/use-api'

const DELETE_ACTION_WIDTH = 80

const DeleteAction = () => (
  <View className="items-center justify-center w-[80px] h-full bg-red-600 rounded-tr-2xl rounded-br-2xl">
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
      <Animated.View className="absolute inset-0 rounded-2xl pointer-events-none" style={animatedStyle} />
    </View>
  )
}

const MyWorkoutsScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { newWorkoutId } = useLocalSearchParams<{ newWorkoutId?: string }>()
  const { workouts, isLoading, isRefetching, refetch } = useWorkoutsQuery()
  const deleteMutation = useDeleteWorkoutMutation()

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

  const confirmDelete = (item: (typeof workouts)[number]) => {
    const title = item.isPersonalCopy ? 'Delete workout?' : 'Remove from library?'
    const description = item.isPersonalCopy
      ? 'This will permanently delete your personal copy. This cannot be undone.'
      : 'This workout will be removed from your library. You can add it back by converting the same video.'

    Alert.alert(title, description, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: item.isPersonalCopy ? 'Delete' : 'Remove',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(item.id),
      },
    ])
  }

  if (isLoading && workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary px-5" style={{ paddingTop: insets.top }} collapsable={false}>
      {/* Header */}
      <View className="pt-4 pb-6">
        <Text className="text-2xl font-inter-bold text-content-primary">My Workouts</Text>
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
                onAction={() => confirmDelete(item)}
              >
                <Pressable onPress={() => router.push(`/(protected)/workout-detail?id=${item.id}`)}>
                  <WorkoutCard workout={item} />
                </Pressable>
              </SwipeableRow>
            )

            return (
              <Animated.View entering={entering} layout={LinearTransition.springify()}>
                {isNew ? <NewWorkoutHighlight>{card}</NewWorkoutHighlight> : card}
              </Animated.View>
            )
          }}
          contentContainerStyle={{ paddingBottom: insets.bottom + TAB_CONTENT_BOTTOM_CLEARANCE, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.content.secondary} />
          }
        />
      )}
    </View>
  )
}

export default MyWorkoutsScreen
