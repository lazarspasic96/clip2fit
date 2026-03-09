import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Clock, Dumbbell, Flame } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { Colors } from '@/constants/colors'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import type { WorkoutPlan } from '@/types/workout'

interface TodaysWorkoutCardProps {
  workout: WorkoutPlan
}

export const TodaysWorkoutCard = ({ workout }: TodaysWorkoutCardProps) => {
  const router = useRouter()
  const { activeWorkoutId } = useActiveWorkout()
  const isActive = activeWorkoutId === workout.id

  return (
    <View className="mx-5 bg-background-tertiary rounded-2xl p-4 overflow-hidden">
      <View className="flex-row">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-inter-bold text-content-primary">{workout.title}</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1" numberOfLines={2}>
            {workout.description}
          </Text>

          <Text className="text-sm font-inter text-content-secondary mt-2">{workout.creatorHandle}</Text>
        </View>

        {workout.thumbnailUrl !== '' && (
          <Image
            source={{ uri: workout.thumbnailUrl }}
            style={{ width: 100, height: 100, borderRadius: 12 }}
            contentFit="cover"
          />
        )}
      </View>

      <View className="flex-row items-center gap-2 mt-4">
        {isActive ? (
          <Button onPress={() => router.push(`/(protected)/(tabs)/(home)/active-workout?id=${workout.id}`)} size="sm">
            Continue
          </Button>
        ) : (
          <>
            <Button onPress={() => router.push(`/(protected)/(tabs)/(home)/active-workout?id=${workout.id}`)} size="sm">
              Start Workout
            </Button>
            <Button onPress={() => router.push(`/(protected)/workout-detail?id=${workout.id}`)} variant="ghost" size="sm">
              View
            </Button>
          </>
        )}
      </View>

      <View className="flex-row items-center gap-4 mt-3 pt-3 border-t border-border-primary">
        <View className="flex-row items-center gap-1">
          <Clock size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">
            {workout.estimatedDurationMinutes} min
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Dumbbell size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">
            {workout.exercises.length} exercises
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Flame size={14} color={Colors.content.tertiary} />
          <Text className="text-xs font-inter text-content-secondary">{workout.difficulty}</Text>
        </View>
      </View>
    </View>
  )
}
