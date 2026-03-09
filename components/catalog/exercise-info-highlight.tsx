import type { LucideIcon } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface ExerciseInfoHighlightProps {
  icon: LucideIcon
  label: string
  value: string
  hasDivider?: boolean
}

export const ExerciseInfoHighlight = ({ icon: Icon, label, value, hasDivider }: ExerciseInfoHighlightProps) => (
  <View className={`flex-1 items-center py-3 ${hasDivider ? 'border-l border-border-primary' : ''}`}>
    <Icon size={18} color={Colors.brand.accent} pointerEvents="none" />
    <Text className="text-sm font-inter-semibold text-content-primary mt-2">{value}</Text>
    <Text className="text-xs font-inter text-content-tertiary mt-0.5">{label}</Text>
  </View>
)
