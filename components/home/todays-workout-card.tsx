import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Clock, Dumbbell, Flame } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { WorkoutPlan } from '@/types/workout'

interface TodaysWorkoutCardProps {
  workout: WorkoutPlan
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/132px-Instagram_logo_2016.svg.png',
  tiktok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/100px-TikTok_logo.svg.png',
  youtube:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/120px-YouTube_full-color_icon_%282017%29.svg.png',
}

export const TodaysWorkoutCard = ({ workout }: TodaysWorkoutCardProps) => {
  const router = useRouter()

  return (
    <View className="mx-5 bg-background-tertiary rounded-2xl p-4 overflow-hidden">
      <View className="flex-row">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-inter-bold text-content-primary">{workout.title}</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1" numberOfLines={2}>
            {workout.description}
          </Text>

          <View className="flex-row items-center gap-1.5 mt-2">
            {PLATFORM_ICONS[workout.platform] !== undefined && (
              <Image source={{ uri: PLATFORM_ICONS[workout.platform] }} style={{ width: 16, height: 16 }} />
            )}
            <Text className="text-sm font-inter text-content-secondary">{workout.creatorHandle}</Text>
          </View>
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
        <Pressable onPress={() => router.push(`/(protected)/active-workout?id=${workout.id}`)} className="bg-brand-accent rounded-md px-4 py-2">
          <Text className="text-sm font-inter-semibold text-background-primary">Start</Text>
        </Pressable>

        <Pressable onPress={() => router.push(`/(protected)/workout-detail?id=${workout.id}`)} className="rounded-md px-4 py-2">
          <Text className="text-sm font-inter text-content-secondary">View</Text>
        </Pressable>

        <Pressable onPress={() => {}} className="rounded-md px-4 py-2">
          <Text className="text-sm font-inter text-content-secondary">Rest</Text>
        </Pressable>
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
