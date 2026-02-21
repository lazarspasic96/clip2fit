import { Image } from 'expo-image'
import { Dumbbell } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { CardAddButton } from '@/components/catalog/card-add-button'
import { SnakeBorder } from '@/components/catalog/designs/snake-border'
import { Colors } from '@/constants/colors'
import type { CatalogExercise } from '@/types/catalog'
import { MUSCLE_GROUP_LABELS } from '@/types/catalog'

const IMAGE_HEIGHT = 120
const BORDER_RADIUS = 16

interface CardMotionPreviewProps {
  exercise: CatalogExercise
  onNavigate: () => void
  onToggle: () => void
  isSelected: boolean
}

export const CardMotionPreview = ({
  exercise,
  onNavigate,
  onToggle,
  isSelected,
}: CardMotionPreviewProps) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withTiming(0.97, { duration: 150 })
  }

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 })
  }

  const hasImage = exercise.images?.start !== undefined

  const levelColor = exercise.level !== null
    ? Colors.difficulty[exercise.level as keyof typeof Colors.difficulty] ?? null
    : null

  const muscleText = exercise.primaryMuscleGroups
    .slice(0, 3)
    .map((m) => MUSCLE_GROUP_LABELS[m] ?? m)
    .join(' \u00B7 ')

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onNavigate}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="rounded-2xl overflow-hidden border border-border-primary bg-background-secondary"
      >
        {/* Exercise image */}
        <View style={{ height: IMAGE_HEIGHT }}>
          {hasImage ? (
            <Image
              source={{ uri: exercise.images?.start }}
              style={{ flex: 1 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          ) : (
            <View className="bg-background-tertiary flex-1 items-center justify-center">
              <Dumbbell size={24} color={Colors.content.tertiary} />
            </View>
          )}
          <View className="absolute bottom-1 left-1 bg-black/50 rounded-xs px-[5px] py-0.5">
            <Text className="text-[8px] font-inter-bold text-content-primary tracking-wider">
              START
            </Text>
          </View>
        </View>

        {/* Add button — top right */}
        <CardAddButton isSelected={isSelected} onToggle={onToggle} position="top-right" />

        {/* Text area */}
        <View className="p-2.5 gap-1">
          <View className="flex-row items-center gap-1.5">
            {levelColor !== null && (
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: levelColor,
                }}
              />
            )}
            <Text
              className="text-sm font-inter-bold text-content-primary flex-1"
              numberOfLines={1}
            >
              {exercise.name}
            </Text>
          </View>

          {muscleText.length > 0 && (
            <Text className="text-xs font-inter text-content-tertiary" numberOfLines={1}>
              {muscleText}
            </Text>
          )}
        </View>

        {/* Selected tint overlay */}
        {isSelected && (
          <View
            pointerEvents="none"
            className="absolute top-0 left-0 right-0 bottom-0 bg-brand-accent/[0.06]"
          />
        )}
      </Pressable>

      {/* Animated snake border */}
      <SnakeBorder isSelected={isSelected} borderRadius={BORDER_RADIUS} />
    </Animated.View>
  )
}
