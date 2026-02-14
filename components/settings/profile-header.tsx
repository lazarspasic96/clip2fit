import { Text, View } from 'react-native'

interface ProfileHeaderProps {
  fullName?: string
  email?: string
}

const getInitials = (name?: string): string => {
  if (name === undefined || name.length === 0) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export const ProfileHeader = ({ fullName, email }: ProfileHeaderProps) => (
  <View className="items-center py-6">
    <View className="w-16 h-16 rounded-full bg-background-tertiary items-center justify-center mb-3">
      <Text className="text-xl font-inter-bold text-content-secondary">
        {getInitials(fullName)}
      </Text>
    </View>
    {fullName !== undefined && fullName.length > 0 && (
      <Text className="text-lg font-inter-bold text-content-primary mb-0.5">{fullName}</Text>
    )}
    {email !== undefined && email.length > 0 && (
      <Text className="text-sm font-inter text-content-secondary">{email}</Text>
    )}
  </View>
)
