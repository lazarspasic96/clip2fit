import { ChevronRight } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import type { StatsTopExercise } from '@/types/stats'

type TopExerciseCardTone = 'default' | 'journal' | 'lab' | 'flow' | 'tiles'

interface TopExerciseCardProps {
  exercise: StatsTopExercise
  index: number
  tone?: TopExerciseCardTone
  onPress: (exercise: StatsTopExercise) => void
}

const toneClasses: Record<TopExerciseCardTone, string> = {
  default: 'bg-background-secondary border border-border-primary rounded-2xl p-4',
  journal: 'bg-background-secondary border border-border-secondary rounded-3xl p-4',
  lab: 'bg-background-primary border border-border-secondary rounded-xl p-4',
  flow: 'bg-background-secondary rounded-3xl p-4',
  tiles: 'bg-background-tertiary rounded-2xl p-4',
}

const trendMultipliers = [0.4, 0.55, 0.78, 0.65, 0.92, 0.72, 1]

export const TopExerciseCard = ({ exercise, index, tone = 'default', onPress }: TopExerciseCardProps) => {
  return (
    <Pressable
      onPress={() => onPress(exercise)}
      className={`${toneClasses[tone]} gap-3`}
      style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}
    >
      <View className="flex-row items-center justify-between">
        <View className="bg-brand-accent rounded-full w-7 h-7 items-center justify-center">
          <Text className="text-xs font-inter-bold text-background-primary">{index + 1}</Text>
        </View>
        <ChevronRight size={16} color={Colors.content.tertiary} />
      </View>

      <View className="gap-1">
        <Text className="text-base font-inter-semibold text-content-primary" numberOfLines={1}>
          {exercise.exerciseName}
        </Text>
        <Text className="text-sm font-inter text-content-secondary">
          {exercise.sessionCount} sessions
        </Text>
      </View>

      <View className="flex-row items-end gap-1 h-8">
        {trendMultipliers.map((multiplier, trendIndex) => (
          <View
            key={`${exercise.exerciseName}-${trendIndex}`}
            className="flex-1 bg-brand-accent rounded-sm"
            style={{
              height: 6 + Math.round(multiplier * 16) + (index % 3),
              opacity: 0.32 + multiplier * 0.68,
            }}
          />
        ))}
      </View>
    </Pressable>
  )
}
