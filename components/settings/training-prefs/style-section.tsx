import { ChipGrid } from '@/components/onboarding/chip-grid'
import { TRAINING_STYLES } from '@/types/profile'
import { Text, View } from 'react-native'

interface StyleSectionProps {
  selected: string[]
  onToggle: (value: string) => void
}

export const StyleSection = ({ selected, onToggle }: StyleSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Training Style
    </Text>
    <ChipGrid options={TRAINING_STYLES} selected={selected} onToggle={onToggle} />
  </View>
)
