import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Button } from '@/components/ui/button'
import type { Equipment } from '@/types/profile'
import { EQUIPMENT_OPTIONS } from '@/types/profile'
import { Text, View } from 'react-native'

const AT_HOME_PRESET: Equipment[] = ['bodyweight', 'dumbbells', 'resistance_bands']
const FULL_GYM_PRESET: Equipment[] = EQUIPMENT_OPTIONS.map((o) => o.value)

interface EquipmentSectionProps {
  selected: Equipment[]
  onToggle: (value: string) => void
  onPreset: (preset: Equipment[]) => void
}

export const EquipmentSection = ({ selected, onToggle, onPreset }: EquipmentSectionProps) => (
  <View className="px-5 py-4">
    <Text className="text-sm font-inter-semibold text-content-secondary uppercase tracking-wide mb-3">
      Equipment
    </Text>
    <View className="flex-row gap-2 mb-4">
      <View className="flex-1">
        <Button variant="secondary" size="sm" onPress={() => onPreset(AT_HOME_PRESET)}>
          At Home
        </Button>
      </View>
      <View className="flex-1">
        <Button variant="secondary" size="sm" onPress={() => onPreset(FULL_GYM_PRESET)}>
          Full Gym
        </Button>
      </View>
    </View>
    <ChipGrid options={EQUIPMENT_OPTIONS} selected={selected} onToggle={onToggle} columns={2} />
  </View>
)
