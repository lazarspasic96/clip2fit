import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

export const CatalogHeader = () => {
  const router = useRouter()

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <Pressable
        onPress={() => router.back()}
        className="w-10 h-10 bg-background-secondary rounded-full items-center justify-center"
      >
        <ChevronLeft size={20} color={Colors.content.primary} pointerEvents="none" />
      </Pressable>

      <Text className="text-lg font-inter-semibold text-content-primary">Exercise Catalog</Text>

      <View className="w-10" />
    </View>
  )
}
