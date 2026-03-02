import { useRouter } from 'expo-router'
import { ActivityIndicator, Pressable, Text, View } from 'react-native'

import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'

const FinishWorkoutScreen = () => {
  const router = useRouter()
  const { session, setFinishResult } = useActiveWorkout()
  const finishMutation = useFinishWorkout()

  if (session === null) return null

  const exercises = session.plan.exercises
  const completed = exercises.filter((e) => e.status === 'completed').length
  const skipped = exercises.filter((e) => e.status === 'skipped').length
  const pending = exercises.filter((e) => e.status === 'pending' || e.status === 'active').length

  const loading = finishMutation.isPending
  const error = finishMutation.error instanceof Error ? finishMutation.error.message : null

  const handleConfirm = () => {
    finishMutation.mutate(session, {
      onSuccess: (data) => {
        setFinishResult(data)
        router.back()
      },
    })
  }

  return (
    <View className="px-6 pb-8 pt-6">
      <SheetTitle>Finish Workout?</SheetTitle>

      <View className="mt-4 gap-2 pt-10">
        <View className="flex-row justify-between">
          <Text className="text-sm font-inter text-content-secondary">Completed</Text>
          <Text className="text-sm font-inter-semibold text-brand-accent">{completed}</Text>
        </View>
        {skipped > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm font-inter text-content-secondary">Skipped</Text>
            <Text className="text-sm font-inter-semibold text-content-tertiary">{skipped}</Text>
          </View>
        )}
        {pending > 0 && (
          <View className="flex-row justify-between">
            <Text className="text-sm font-inter text-content-secondary">Pending</Text>
            <Text className="text-sm font-inter-semibold text-yellow-400">{pending}</Text>
          </View>
        )}
      </View>

      {pending > 0 && (
        <Text className="text-xs font-inter text-yellow-400 text-center mt-3">
          {pending} exercise{pending > 1 ? 's' : ''} still pending
        </Text>
      )}

      {error !== null && <Text className="text-sm font-inter text-red-400 text-center mt-2">{error}</Text>}

      <View className="flex-row gap-3 mt-6">
        <Pressable
          onPress={() => router.back()}
          disabled={loading}
          className="flex-1 rounded-md py-2.5 bg-background-tertiary"
        >
          <Text className="text-sm font-inter-semibold text-content-primary text-center">Keep Going</Text>
        </Pressable>
        <Pressable onPress={handleConfirm} disabled={loading} className="flex-1 rounded-md py-2.5 bg-brand-accent">
          {loading ? (
            <ActivityIndicator size="small" color={Colors.background.primary} />
          ) : (
            <Text className="text-sm font-inter-semibold text-background-primary text-center">Finish Workout</Text>
          )}
        </Pressable>
      </View>
    </View>
  )
}

export default FinishWorkoutScreen
