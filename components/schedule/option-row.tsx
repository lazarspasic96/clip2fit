import { Pressable, Text } from 'react-native'

import { Colors } from '@/constants/colors'

interface OptionRowProps {
  icon: React.ReactNode
  label: string
  onPress: () => void
  destructive?: boolean
}

export const OptionRow = ({ icon, label, onPress, destructive = false }: OptionRowProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center gap-3 px-4 py-3 rounded-lg bg-background-tertiary"
  >
    {icon}
    <Text
      className="text-sm font-inter-semibold"
      style={{ color: destructive ? Colors.badge.error.content : Colors.content.primary }}
    >
      {label}
    </Text>
  </Pressable>
)
