import { NumberSelector } from '@/components/onboarding/number-selector'
import { SelectionCard } from '@/components/onboarding/selection-card'
import { SESSION_DURATIONS, TRAINING_FREQUENCIES } from '@/types/profile'
import { Clock, Zap } from 'lucide-react-native'
import { Text, View } from 'react-native'

interface ScheduleSectionProps {
  frequency: number | undefined
  onFrequencyChange: (value: number) => void
  duration: number | undefined
  onDurationChange: (value: number) => void
}

export const ScheduleSection = ({
  frequency,
  onFrequencyChange,
  duration,
  onDurationChange,
}: ScheduleSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Schedule
    </Text>
    <Text className="text-sm font-inter-medium text-content-secondary mb-2">
      Days per week
    </Text>
    <NumberSelector options={TRAINING_FREQUENCIES} value={frequency} onChange={onFrequencyChange} />
    <Text className="text-sm font-inter-medium text-content-secondary mt-5 mb-2">
      Session duration
    </Text>
    <View className="gap-2">
      {SESSION_DURATIONS.map((option) => (
        <SelectionCard
          key={option.value}
          icon={option.value === 15 ? Zap : Clock}
          title={option.label}
          subtitle={option.subtitle}
          selected={duration === option.value}
          onPress={() => onDurationChange(option.value)}
        />
      ))}
    </View>
  </View>
)
