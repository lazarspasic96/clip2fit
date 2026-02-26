import { Text, View } from 'react-native'

import { MuscleChip } from '@/components/ui/muscle-chip'

interface ExerciseMuscleGroupsProps {
  primary: string[]
  secondary: string[]
}

export const ExerciseMuscleGroups = ({ primary, secondary }: ExerciseMuscleGroupsProps) => {
  return (
    <View className="gap-4">
      {/* Primary muscles */}
      <View>
        <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
          Primary Muscles
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {primary.map((muscle) => (
            <MuscleChip key={muscle} muscle={muscle} size="sm" tone="soft" />
          ))}
        </View>
      </View>

      {/* Secondary muscles */}
      {secondary.length > 0 && (
        <View>
          <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
            Secondary Muscles
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {secondary.map((muscle) => (
              <MuscleChip key={muscle} muscle={muscle} size="sm" tone="soft" />
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
