import { SelectionCard } from '@/components/onboarding/selection-card'
import type { ExperienceLevel } from '@/types/profile'
import { EXPERIENCE_LEVELS } from '@/types/profile'
import { Flame, Sprout, Trophy } from 'lucide-react-native'
import { Text, View } from 'react-native'

const ICONS = {
  beginner: Sprout,
  intermediate: Flame,
  advanced: Trophy,
} as const

interface ExperienceSectionProps {
  value: ExperienceLevel | undefined
  onChange: (value: ExperienceLevel) => void
}

export const ExperienceSection = ({ value, onChange }: ExperienceSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Experience Level
    </Text>
    <View className="gap-2">
      {EXPERIENCE_LEVELS.map((option) => (
        <SelectionCard
          key={option.value}
          icon={ICONS[option.value]}
          title={option.label}
          subtitle={option.subtitle}
          selected={value === option.value}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  </View>
)
