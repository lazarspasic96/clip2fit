import { Pressable, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { Download, Video } from 'lucide-react-native'

import { Colors } from '@/constants/colors'

export const BottomActionButtons = () => {
  const router = useRouter()

  return (
    <View className="flex-row mx-5 gap-3">
      <Pressable
        onPress={() => router.push('/(protected)/add-workout')}
        className="flex-1 bg-background-secondary rounded-2xl p-4 items-center gap-2"
      >
        <Video size={24} color={Colors.content.primary} />
        <Text className="text-sm font-inter text-content-primary text-center">
          Import workout from video
        </Text>
      </Pressable>

      <Pressable
        onPress={() => console.log('Import manually')}
        className="flex-1 bg-background-secondary rounded-2xl p-4 items-center gap-2"
      >
        <Download size={24} color={Colors.content.primary} />
        <Text className="text-sm font-inter text-content-primary text-center">
          Import workout manually
        </Text>
      </Pressable>
    </View>
  )
}
