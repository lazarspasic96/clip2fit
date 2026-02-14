import { Text, View } from 'react-native'

interface SettingsSectionProps {
  title: string
  children: React.ReactNode
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <View className="mb-6">
    <Text className="text-xs font-inter-semibold text-content-tertiary uppercase tracking-wider mb-2 px-1">
      {title}
    </Text>
    <View className="gap-1">{children}</View>
  </View>
)
