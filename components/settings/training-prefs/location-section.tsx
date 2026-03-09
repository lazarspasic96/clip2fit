import { SelectionCard } from '@/components/onboarding/selection-card'
import type { WorkoutLocation } from '@/types/profile'
import { WORKOUT_LOCATIONS } from '@/types/profile'
import { ArrowLeftRight, Building, Home, Trees } from 'lucide-react-native'
import { Text, View } from 'react-native'

const ICONS = {
  gym: Building,
  home: Home,
  both: ArrowLeftRight,
  outdoor: Trees,
} as const

interface LocationSectionProps {
  value: WorkoutLocation | undefined
  onChange: (value: WorkoutLocation) => void
}

export const LocationSection = ({ value, onChange }: LocationSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Workout Location
    </Text>
    <View className="gap-2">
      {WORKOUT_LOCATIONS.map((option) => (
        <SelectionCard
          key={option.value}
          icon={ICONS[option.value]}
          title={option.label}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  </View>
)
