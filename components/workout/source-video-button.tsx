import { Colors } from '@/constants/colors'
import { ExternalLink } from 'lucide-react-native'
import { Linking, Pressable, Text } from 'react-native'

interface SourceVideoButtonProps {
  url: string | null
}

export const SourceVideoButton = ({ url }: SourceVideoButtonProps) => {
  if (url === null) return null

  const handlePress = async () => {
    const canOpen = await Linking.canOpenURL(url)
    if (canOpen) {
      await Linking.openURL(url)
    }
  }

  return (
    <Pressable onPress={handlePress} className="flex-row items-center gap-1.5 mt-2">
      <ExternalLink size={14} color={Colors.brand.accent} pointerEvents="none" />
      <Text className="text-xs font-inter-medium text-brand-accent">Watch Video</Text>
    </Pressable>
  )
}
