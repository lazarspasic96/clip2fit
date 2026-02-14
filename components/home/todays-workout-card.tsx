import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { Clock, Dumbbell, Flame } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

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
          <Pressable
            onPress={() => router.push(`/(protected)/(tabs)/(home)/active-workout?id=${workout.id}`)}
            className="bg-brand-accent rounded-md px-4 py-2"
          >
            <Text className="text-sm font-inter-semibold text-background-primary">Continue</Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => router.push(`/(protected)/(tabs)/(home)/active-workout?id=${workout.id}`)}
              className="bg-brand-accent rounded-md px-4 py-2"
            >
              <Text className="text-sm font-inter-semibold text-background-primary">Start Workout</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push(`/(protected)/workout-detail?id=${workout.id}`)}
              className="rounded-md px-4 py-2"
            >
              <Text className="text-sm font-inter text-content-secondary">View</Text>
            </Pressable>
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
