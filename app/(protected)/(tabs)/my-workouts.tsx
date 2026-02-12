import { Trash2 } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native'
import Animated, { FadeInUp, LinearTransition } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { WorkoutCard } from '@/components/my-workouts/workout-card'
import { EmptyState } from '@/components/my-workouts/empty-state'
import { SwipeableRow } from '@/components/ui/swipeable-row'
import { ConfirmationSheet } from '@/components/ui/confirmation-sheet'
import { Colors } from '@/constants/colors'
import { TAB_BAR_HEIGHT } from '@/constants/layout'
import { useDeleteWorkoutMutation, useWorkoutsQuery } from '@/hooks/use-api'

const DELETE_ACTION_WIDTH = 80

const DeleteAction = () => (
  <View className="items-center justify-center" style={{ width: DELETE_ACTION_WIDTH, height: '100%', backgroundColor: '#dc2626', borderTopRightRadius: 16, borderBottomRightRadius: 16 }}>
    <Trash2 size={20} color="#fff" pointerEvents="none" />
    <Text className="text-xs font-inter-semibold text-white mt-1">Delete</Text>
  </View>
)

const MyWorkoutsScreen = () => {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { workouts, isLoading, isRefetching, refetch } = useWorkoutsQuery()
  const deleteMutation = useDeleteWorkoutMutation()

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const handleDeleteConfirm = () => {
    if (deleteTargetId === null) return
    deleteMutation.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteTargetId(null)
      },
    })
  }

  const deleteTarget = deleteTargetId !== null
    ? workouts.find((w) => w.id === deleteTargetId) ?? null
    : null

  const deleteTitle = deleteTarget?.isPersonalCopy
    ? 'Delete workout?'
    : 'Remove from library?'

  const deleteDescription = deleteTarget?.isPersonalCopy
    ? 'This will permanently delete your personal copy. This cannot be undone.'
    : 'This workout will be removed from your library. You can add it back by converting the same video.'

  const deleteError = deleteMutation.error !== null
    ? (deleteMutation.error instanceof Error ? deleteMutation.error.message : 'Failed to delete')
    : null

  if (isLoading && workouts.length === 0) {
    return (
      <View className="flex-1 bg-background-primary justify-center items-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-inter-bold text-content-primary">My Workouts</Text>
      </View>

      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={workouts}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <Animated.View
              entering={mountedRef.current ? FadeInUp.delay(index * 40).springify() : undefined}
              layout={LinearTransition.springify()}
              className="mx-5 mb-3"
            >
              <SwipeableRow
                actionWidth={DELETE_ACTION_WIDTH}
                actionContent={<DeleteAction />}
                onAction={() => setDeleteTargetId(item.id)}
              >
                <Pressable onPress={() => router.push(`/(protected)/workout-detail?id=${item.id}`)}>
                  <WorkoutCard workout={item} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          )}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + 16 }}
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
