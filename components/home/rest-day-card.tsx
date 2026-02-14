import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Info } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

export const RestDayCard = () => {
  const router = useRouter()

  return (
    <View className="mx-5 bg-background-secondary rounded-2xl p-4 overflow-hidden">
      <View className="flex-row">
        <View className="flex-1 mr-3">
          <Text className="text-lg font-inter-bold text-content-primary">It{`'`}s time for rest.</Text>
          <Text className="text-sm font-inter text-content-secondary mt-1">No workout for today!</Text>

          <Pressable
            onPress={() => router.push('/(protected)/(tabs)/schedule')}
            className="bg-brand-accent rounded-md px-4 py-2 self-start mt-4"
          >
            <Text className="text-sm font-inter-semibold text-background-primary">Edit</Text>
          </Pressable>
        </View>

        {/* TODO: Replace with local asset */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop' }}
          style={{ width: 100, height: 100, borderRadius: 12 }}
          contentFit="cover"
        />
      </View>

      <View className="flex-row items-start gap-2 mt-4 pt-3 border-t border-border-primary">
        <Info size={16} color={Colors.brand.accent} style={{ marginTop: 2 }} />
        <View className="flex-1">
          <Text className="text-sm font-inter-semibold text-content-primary">Tip</Text>
          <Text className="text-sm font-inter text-content-secondary mt-0.5">
            Make sure to stay hydrated to keep your body healthy!
          </Text>
        </View>
      </View>
    </View>
  )
}
