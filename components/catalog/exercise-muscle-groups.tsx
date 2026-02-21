import { Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

interface ExerciseMuscleGroupsProps {
  primary: string[]
  secondary: string[]
}

export const ExerciseMuscleGroups = ({ primary, secondary }: ExerciseMuscleGroupsProps) => {
  return (
    <View style={{ gap: 16 }}>
      {/* Primary muscles */}
      <View>
        <Text className="text-xs font-inter-bold text-content-tertiary uppercase tracking-wider mb-2">
          Primary Muscles
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {primary.map((muscle) => (
            <View key={muscle} className="bg-background-badge-success rounded-full px-3 py-1.5">
              <Text
                className="text-xs font-inter-semibold"
                style={{ color: Colors.badge.success.content }}
              >
                {MUSCLE_GROUP_LABELS[muscle] ?? muscle}
              </Text>
            </View>
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
              <View key={muscle} className="bg-background-tertiary rounded-full px-3 py-1.5">
                <Text className="text-xs font-inter text-content-secondary">
                  {MUSCLE_GROUP_LABELS[muscle] ?? muscle}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}
