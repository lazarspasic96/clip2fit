import { Colors } from '@/constants/colors'
import { Check } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

type ChipState = 'suggested' | 'applied' | 'overridden'

interface SmartTargetChipProps {
  target: { weight: number; delta: number; isProgress: boolean }
  state: ChipState
  weightUnit: 'kg' | 'lbs'
  onApply: () => void
}

const formatLabel = (
  target: SmartTargetChipProps['target'],
  state: ChipState,
  unit: string,
): string => {
  if (state === 'overridden') return `${target.weight}${unit}`
  if (state === 'applied') return `${target.weight}${unit}`
  // suggested
  if (target.isProgress) return `${target.weight}${unit} +${target.delta}`
  return `${target.weight}${unit} same`
}

export const SmartTargetChip = ({ target, state, weightUnit, onApply }: SmartTargetChipProps) => {
  const label = formatLabel(target, state, weightUnit)

  if (state === 'suggested') {
    return (
      <Pressable
        onPress={onApply}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="button"
        accessibilityLabel={`Apply suggested weight of ${target.weight} ${weightUnit === 'kg' ? 'kilograms' : 'pounds'}`}
        className="self-center rounded-md bg-brand-accent/8 px-2 py-0.5"
      >
        <Text className="text-xs font-inter font-medium text-content-secondary">{label}</Text>
      </Pressable>
    )
  }

  if (state === 'applied') {
    return (
      <View className="self-center flex-row items-center rounded-md bg-brand-accent/15 px-2 py-0.5 gap-1">
        <Check size={10} color={Colors.brand.accent} pointerEvents="none" />
        <Text className="text-xs font-inter font-medium text-brand-accent">{label}</Text>
      </View>
    )
  }

  // overridden
  return (
    <View className="self-center rounded-md bg-brand-accent/8 px-2 py-0.5 opacity-40">
      <Text className="text-xs font-inter font-medium text-content-secondary">{label}</Text>
    </View>
  )
}
