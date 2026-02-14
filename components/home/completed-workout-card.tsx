import { useRouter } from 'expo-router'
import { Image } from 'expo-image'
import { CheckCircle } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { WorkoutPlan } from '@/types/workout'

interface CompletedWorkoutCardProps {
  workout: WorkoutPlan
}

export const CompletedWorkoutCard = ({ workout }: CompletedWorkoutCardProps) => {
  const router = useRouter()

  return (
    <View className="mx-5 bg-background-tertiary rounded-2xl p-4 overflow-hidden">
      <View className="flex-row items-center gap-2 mb-3">
        <CheckCircle size={20} color={Colors.brand.accent} />
        <Text className="text-base font-inter-bold text-brand-accent">Workout Complete</Text>
      </View>

      <View className="flex-row">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-inter-bold text-content-primary">{workout.title}</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1">
            Great job finishing today{`'`}s workout!
          </Text>
        </View>

        {workout.thumbnailUrl !== '' && (
          <Image
            source={{ uri: workout.thumbnailUrl }}
            style={{ width: 80, height: 80, borderRadius: 12 }}
            contentFit="cover"
          />
        )}
      </View>

      <View className="flex-row items-center gap-3 mt-4">
        <Pressable
          onPress={() => router.push(`/(protected)/(tabs)/(home)/active-workout?id=${workout.id}`)}
          className="bg-brand-accent rounded-md px-4 py-2"
        >
          <Text className="text-sm font-inter-semibold text-background-primary">Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/(protected)/workout-detail?id=${workout.id}`)}
          className="rounded-md px-4 py-2"
        >
          <Text className="text-sm font-inter text-content-secondary">View</Text>
        </Pressable>
      </View>
    </View>
  )
}
