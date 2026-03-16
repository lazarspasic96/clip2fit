import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'

const formatDurationLabel = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`
  return `${Math.round(seconds / 60)} min`
}

const FinishWorkoutScreen = () => {
  const router = useRouter()
  const { session, setFinishResult } = useActiveWorkout()
  const finishMutation = useFinishWorkout()

  if (session === null) return null

  const exercises = session.plan.exercises
  const completed = exercises.filter((e) => e.status === 'completed').length
  const skipped = exercises.filter((e) => e.status === 'skipped').length
  const pending = exercises.filter((e) => e.status === 'pending' || e.status === 'active').length

  const now = Date.now()
  const pausedMs = session.status === 'paused' && session.pausedAt !== undefined
    ? session.totalPausedMs + (now - session.pausedAt)
    : session.totalPausedMs
  const wallClockSeconds = Math.floor((now - session.startedAt) / 1000)
  const activeSeconds = Math.max(0, wallClockSeconds - Math.floor(pausedMs / 1000))
  const hasPauses = pausedMs > 0

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
        <View className="flex-row justify-between mt-1 pt-2 border-t border-border-primary">
          <Text className="text-sm font-inter text-content-secondary">Duration</Text>
          <Text className="text-sm font-inter-semibold text-content-primary">
            {formatDurationLabel(activeSeconds)}{hasPauses ? ' active' : ''}
            {hasPauses ? ` (${formatDurationLabel(wallClockSeconds)} total)` : ''}
          </Text>
        </View>
      </View>

      {pending > 0 && (
        <Text className="text-xs font-inter text-yellow-400 text-center mt-3">
          {pending} exercise{pending > 1 ? 's' : ''} still pending
        </Text>
      )}

      {error !== null && <Text className="text-sm font-inter text-red-400 text-center mt-2">{error}</Text>}

      <View className="flex-row gap-3 mt-6">
        <Button onPress={() => router.back()} disabled={loading} variant="secondary" size="sm" className="flex-1">
          Keep Going
        </Button>
        <Button onPress={handleConfirm} loading={loading} size="sm" className="flex-1">
          Finish Workout
        </Button>
      </View>
    </View>
  )
}

export default FinishWorkoutScreen
