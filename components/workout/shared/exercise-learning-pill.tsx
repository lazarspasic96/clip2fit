import { Image } from 'expo-image'
import { BookOpen, Dumbbell } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface ExerciseLearningPillProps {
  title: string
  startImageUrl: string | null
  endImageUrl: string | null
  onPress: () => void
}

const PreviewImage = ({ uri }: { uri: string | null }) => {
  if (uri === null) {
    return (
      <View className="bg-background-tertiary items-center justify-center rounded-xl" style={{ width: 84, height: 84 }}>
        <Dumbbell size={22} color={Colors.content.tertiary} pointerEvents="none" />
      </View>
    )
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: 84, height: 84, borderRadius: 12 }}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
  )
}

export const ExerciseLearningPill = ({ title, startImageUrl, endImageUrl, onPress }: ExerciseLearningPillProps) => {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center rounded-3xl bg-background-secondary border border-border-secondary px-3 py-3 gap-3"
      style={{ boxShadow: '0 12px 26px rgba(0,0,0,0.32)' }}
    >
      <PreviewImage uri={startImageUrl ?? endImageUrl} />

      <View className="flex-1 pr-1">
        <Text className="text-xs font-inter-medium text-content-tertiary">Current exercise</Text>
        <Text className="text-base font-inter-semibold text-content-primary mt-0.5" numberOfLines={2}>
          {title}
        </Text>
        <View className="self-start rounded-full bg-background-tertiary px-2 py-1">
          <Text className="text-[11px] font-inter-medium text-content-secondary">How to perform</Text>
        </View>
      </View>

      <View className="w-9 h-9 rounded-full bg-brand-accent items-center justify-center">
        <BookOpen size={16} color={Colors.background.primary} pointerEvents="none" />
      </View>
    </Pressable>
  )
}
