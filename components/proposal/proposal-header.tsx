import { Clock, Dumbbell, Flame } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { PlatformBadge } from '@/components/processing/platform-badge'
import { Colors } from '@/constants/colors'
import type { WorkoutPlan } from '@/types/workout'

interface ProposalHeaderProps {
  workout: WorkoutPlan
  exerciseCount: number
}

const DIFFICULTY_CLASSES: Record<string, string> = {
  beginner: 'text-difficulty-beginner',
  intermediate: 'text-difficulty-intermediate',
  advanced: 'text-difficulty-advanced',
}

export const ProposalHeader = ({ workout, exerciseCount }: ProposalHeaderProps) => {
  const creatorDisplay = workout.creatorName !== null
    ? `${workout.creatorName} (${workout.creatorHandle})`
    : workout.creatorHandle

  return (
    <View className="px-5 pb-4">
      <View className="flex-row items-center gap-3 mb-3">
        <PlatformBadge platform={workout.platform} size={36} />
        <View className="flex-1">
          <Text className="text-lg font-inter-bold text-content-primary">{workout.title}</Text>
          {creatorDisplay.length > 0 && (
            <Text className="text-sm font-inter text-content-secondary">{creatorDisplay}</Text>
          )}
        </View>
      </View>

      {workout.description.length > 0 && (
        <Text className="text-sm font-inter text-content-secondary mb-3">{workout.description}</Text>
      )}

      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Dumbbell size={14} color={Colors.content.secondary} pointerEvents="none" />
          <Text className="text-sm font-inter text-content-secondary">{exerciseCount} exercises</Text>
        </View>
        {workout.estimatedDurationMinutes > 0 && (
          <View className="flex-row items-center gap-1.5">
            <Clock size={14} color={Colors.content.secondary} pointerEvents="none" />
            <Text className="text-sm font-inter text-content-secondary">{workout.estimatedDurationMinutes} min</Text>
          </View>
        )}
        <View className="flex-row items-center gap-1.5">
          <Flame size={14} color={Colors.content.secondary} pointerEvents="none" />
          <Text className={`text-sm font-inter-semibold ${DIFFICULTY_CLASSES[workout.difficulty] ?? 'text-content-secondary'}`}>
            {workout.difficulty}
          </Text>
        </View>
      </View>

      {workout.targetMuscles !== undefined && workout.targetMuscles.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mt-3">
          {workout.targetMuscles.map((muscle) => (
            <View key={muscle} className="bg-background-tertiary rounded-full px-3 py-1">
              <Text className="text-xs font-inter text-content-secondary">{muscle}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}
