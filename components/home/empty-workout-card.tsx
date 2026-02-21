import { useRouter } from 'expo-router'
import { Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

export const EmptyWorkoutCard = () => {
  const router = useRouter()

  return (
    <Pressable
      onPress={() => router.push('/(protected)/add-workout')}
      className="mx-5 bg-background-tertiary rounded-2xl p-4 flex-row items-center gap-4"
    >
      <View className="w-11 h-11 items-center justify-center rounded-full bg-brand-accent">
        <Plus size={22} color={Colors.background.primary} strokeWidth={2.5} pointerEvents="none" />
      </View>

      <View className="flex-1">
        <Text className="text-base font-inter-bold text-content-primary">Add/Import workout!</Text>
        <Text className="text-sm font-inter text-content-secondary mt-0.5">
          Import or add training from your phone or social.
        </Text>
      </View>
    </Pressable>
  )
}
