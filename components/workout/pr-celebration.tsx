import * as Haptics from 'expo-haptics'
import { Trophy } from 'lucide-react-native'
import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { Colors } from '@/constants/colors'
import type { ApiPR } from '@/types/api'

const AUTO_DISMISS_MS = 5000

interface PrCelebrationProps {
  prs: ApiPR[]
  onDismiss: () => void
}

export const PrCelebration = ({ prs, onDismiss }: PrCelebrationProps) => {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS)
    return () => clearTimeout(timeout)
  }, [onDismiss])

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      className="absolute inset-0 justify-center items-center bg-overlay"
    >
      <View className="items-center px-8">
        <Trophy size={56} color={Colors.brand.accent} pointerEvents="none" />
        <Text className="text-2xl font-inter-bold text-content-primary mt-4">Personal Record!</Text>

        <View className="mt-6 gap-3 w-full">
          {prs.map((pr) => (
            <View key={pr.exercise_id} className="bg-background-secondary rounded-lg px-4 py-3">
              <Text className="text-base font-inter-bold text-content-primary">{pr.exercise_name}</Text>
              <Text className="text-sm font-inter text-brand-accent mt-1">
                {pr.new_weight}kg
                {pr.previous_weight !== null && (
                  <Text className="text-content-tertiary"> (was {pr.previous_weight}kg)</Text>
                )}
              </Text>
            </View>
          ))}
        </View>

        <Pressable onPress={onDismiss} className="mt-8 rounded-md px-8 py-3 bg-brand-accent">
          <Text className="text-base font-inter-bold text-background-primary">Nice!</Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}
