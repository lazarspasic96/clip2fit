import { ChipGrid } from '@/components/onboarding/chip-grid'
import { FOCUS_AREAS } from '@/types/profile'
import { Text, View } from 'react-native'

const EXCLUSIVE_VALUES = ['full_body']

interface FocusSectionProps {
  selected: string[]
  onToggle: (value: string) => void
}

export const FocusSection = ({ selected, onToggle }: FocusSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Focus Areas
    </Text>
    <ChipGrid
      options={FOCUS_AREAS}
      selected={selected}
      onToggle={onToggle}
      exclusive={EXCLUSIVE_VALUES}
      columns={2}
    />
  </View>
)
