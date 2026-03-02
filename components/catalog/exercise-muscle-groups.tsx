import { Text, View } from 'react-native'

import { MuscleChip } from '@/components/ui/muscle-chip'

interface ExerciseMuscleGroupsProps {
  target: string
  secondaryMuscles: string[]
  bodyPart?: string
}

export const ExerciseMuscleGroups = ({ target, secondaryMuscles, bodyPart }: ExerciseMuscleGroupsProps) => {
  return (
    <View className="gap-4">
      {/* Target muscle */}
      <View>
        <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
          Target Muscle
        </Text>
        <View className="flex-row flex-wrap gap-2">
          <MuscleChip muscle={target} size="sm" tone="soft" />
          {bodyPart !== undefined && bodyPart.length > 0 && (
            <View className="bg-background-tertiary rounded-full px-3 py-1">
              <Text className="text-xs font-inter-medium text-content-tertiary capitalize">
                {bodyPart}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Secondary muscles */}
      {secondaryMuscles.length > 0 && (
        <View>
          <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
            Secondary Muscles
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {secondaryMuscles.map((muscle) => (
              <MuscleChip key={muscle} muscle={muscle} size="sm" tone="soft" />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
