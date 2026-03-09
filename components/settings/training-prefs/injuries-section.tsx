import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Colors } from '@/constants/colors'
import { INJURY_TAGS } from '@/types/profile'
import { Text, TextInput, View } from 'react-native'

const EXCLUSIVE_VALUES = ['none']

interface InjuriesSectionProps {
  selected: string[]
  onToggle: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}

export const InjuriesSection = ({ selected, onToggle, notes, onNotesChange }: InjuriesSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Injuries & Limitations
    </Text>
    <ChipGrid
      options={INJURY_TAGS}
      selected={selected}
      onToggle={onToggle}
      exclusive={EXCLUSIVE_VALUES}
      columns={2}
    />
    <Text className="text-sm font-inter-medium text-content-secondary mt-4 mb-2">
      Additional notes (optional)
    </Text>
    <TextInput
      value={notes}
      onChangeText={onNotesChange}
      placeholder="E.g., recovering from shoulder surgery..."
      placeholderTextColor={Colors.content.tertiary}
      maxLength={200}
      multiline
      numberOfLines={3}
      className="bg-background-secondary border border-border-primary rounded-xl px-4 py-3 text-content-primary text-sm font-inter"
      style={{ minHeight: 80, textAlignVertical: 'top', borderCurve: 'continuous' }}
    />
  </View>
)
