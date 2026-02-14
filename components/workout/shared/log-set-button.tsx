import { Pressable, Text } from 'react-native'

interface LogSetButtonProps {
  onPress: () => void
  disabled?: boolean
}

export const LogSetButton = ({ onPress, disabled = false }: LogSetButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="w-full rounded-lg py-3.5 bg-brand-accent items-center justify-center"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <Text className="text-base font-inter-bold text-background-primary tracking-wide">LOG SET</Text>
    </Pressable>
  )
}
