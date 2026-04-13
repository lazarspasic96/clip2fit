import { useLocalSearchParams, useRouter } from 'expo-router'
import { Trash2 } from 'lucide-react-native'
import { useEffect, useRef } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, {
  FadeInUp,
  LinearTransition,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EmptyState } from '@/components/my-workouts/empty-state'
import { ScreenBlurTarget } from '@/components/ui/screen-blur-target'
import {
  BlurredScreenHeader,
  getBlurredScreenHeaderHeight,
} from '@/components/ui/blurred-screen-header'
import { WorkoutCard } from '@/components/my-workouts/workout-card'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { Colors } from '@/constants/colors'
import { TAB_CONTENT_BOTTOM_CLEARANCE } from '@/constants/tab-bar'

import { useDeleteWorkoutMutation, useWorkoutsQuery } from '@/hooks/use-api'
import { useSubscription } from '@/contexts/subscription-context'
import { FREE_WORKOUT_LIMIT } from '@/types/subscription'

const DELETE_ACTION_WIDTH = 80
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<any>)

const DeleteAction = () => (
  <View className="items-center justify-center w-[80px] h-full bg-red-600 rounded-2xl">
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
  const { isPremium } = useSubscription()

  const blurTargetRef = useRef<View>(null)
  const mountedRef = useRef(true)
  const newWorkoutIdRef = useRef(newWorkoutId)
  const headerHeight = getBlurredScreenHeaderHeight(insets.top)
  const scrollY = useSharedValue(0)
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y
    },
  })

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
      <View className="flex-1 bg-background-primary" collapsable={false}>
        <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
          <View className="flex-1 items-center justify-center" style={{ paddingTop: headerHeight }}>
            <ActivityIndicator size="large" />
          </View>
        </ScreenBlurTarget>
        <BlurredScreenHeader blurTarget={blurTargetRef} title="My Workouts" scrollY={scrollY} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" collapsable={false}>
      <ScreenBlurTarget targetRef={blurTargetRef} className="flex-1">
        {workouts.length === 0 ? (
          <View className="flex-1 px-5" style={{ paddingTop: headerHeight + 12 }}>
            <EmptyState />
          </View>
        ) : (
          <AnimatedFlatList
            data={workouts}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={
              !isPremium && workouts.length > 0 ? (
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-xs font-inter text-content-tertiary">
                    {workouts.length}/{FREE_WORKOUT_LIMIT} workouts
                  </Text>
                  {workouts.length >= FREE_WORKOUT_LIMIT && (
                    <Text className="text-xs font-inter-semibold text-brand-accent">
                      Upgrade for unlimited
                    </Text>
                  )}
                </View>
              ) : undefined
            }
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
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{
              paddingTop: headerHeight + 12,
              paddingHorizontal: 20,
              paddingBottom: insets.bottom + TAB_CONTENT_BOTTOM_CLEARANCE,
            }}
            contentInsetAdjustmentBehavior="never"
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            scrollIndicatorInsets={{ top: headerHeight }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                progressViewOffset={headerHeight}
                tintColor={Colors.content.secondary}
              />
            }
          />
        )
        }
      </ScreenBlurTarget>
      <BlurredScreenHeader blurTarget={blurTargetRef} title="My Workouts" scrollY={scrollY} />
    </View>
  )
}

export default MyWorkoutsScreen
