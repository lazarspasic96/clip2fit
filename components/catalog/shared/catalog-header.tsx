import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'

import { BackButton } from '@/components/ui/back-button'

export const CatalogHeader = () => {
  const router = useRouter()

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <BackButton onPress={() => router.back()} />

      <Text className="text-lg font-inter-semibold text-content-primary">Exercise Catalog</Text>

      <View className="w-10" />
    </View>
  )
}
