import { Image } from 'expo-image'
import { Clock, Dumbbell, Flame } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { PlatformBadge } from '@/components/processing/platform-badge'
import { Colors } from '@/constants/colors'
import type { WorkoutPlan } from '@/types/workout'

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#eab308',
  advanced: '#ef4444',
}

interface WorkoutCardProps {
  workout: WorkoutPlan
}

export const WorkoutCard = ({ workout }: WorkoutCardProps) => {
  const difficultyColor = DIFFICULTY_COLORS[workout.difficulty] ?? Colors.content.tertiary

  return (
    <View className="bg-background-secondary p-4 flex-row">
      {/* Left accent bar */}
      <View
        style={{
          width: 3,
          borderRadius: 2,
          backgroundColor: Colors.brand.accent,
          marginRight: 12,
        }}
      />

      {/* Content */}
      <View className="flex-1 mr-3">
        {/* Title + platform icon */}
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-base font-inter-bold text-content-primary flex-1 flex-shrink" numberOfLines={1}>
            {workout.title}
          </Text>
          <PlatformBadge platform={workout.platform} size={24} />
        </View>

        {/* Description */}
        {workout.description.length > 0 && (
          <Text className="text-sm font-inter text-content-secondary mb-2" numberOfLines={2}>
            {workout.description}
          </Text>
        )}

        {/* Metadata row */}
        <View className="flex-row items-center gap-4">
          <View className="flex-row items-center gap-1">
            <Dumbbell size={13} color={Colors.brand.accent} pointerEvents="none" />
            <Text className="text-xs font-inter text-content-secondary">
              {workout.exercises.length}
            </Text>
          </View>
          {workout.estimatedDurationMinutes > 0 && (
            <View className="flex-row items-center gap-1">
              <Clock size={13} color={Colors.brand.accent} pointerEvents="none" />
              <Text className="text-xs font-inter text-content-secondary">
                {workout.estimatedDurationMinutes} min
              </Text>
            </View>
          )}
          <View className="flex-row items-center gap-1">
            <Flame size={13} color={difficultyColor} pointerEvents="none" />
            <Text className="text-xs font-inter" style={{ color: difficultyColor }}>
              {workout.difficulty}
            </Text>
          </View>
        </View>

        {/* Creator */}
        {workout.creatorHandle.length > 0 && (
          <Text className="text-xs font-inter text-content-tertiary mt-2" numberOfLines={1}>
            @{workout.creatorHandle}
          </Text>
        )}
      </View>

      {/* Thumbnail */}
      {workout.thumbnailUrl.length > 0 && (
        <Image
          source={{ uri: workout.thumbnailUrl }}
          style={{ width: 52, height: 52, borderRadius: 10 }}
          contentFit="cover"
        />
      )}
    </View>
  )
}
