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

const LEVEL_COLORS: Record<string, string> = {
  beginner: '#22c55e',
  intermediate: '#eab308',
  expert: '#ef4444',
}

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
    ? LEVEL_COLORS[exercise.level] ?? null
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
        style={{
          borderRadius: BORDER_RADIUS,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: Colors.border.primary,
          backgroundColor: Colors.background.secondary,
        }}
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
            <View
              className="bg-background-tertiary"
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Dumbbell size={24} color={Colors.content.tertiary} />
            </View>
          )}
          <View
            style={{
              position: 'absolute',
              bottom: 4,
              left: 4,
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderRadius: 4,
              paddingHorizontal: 5,
              paddingVertical: 2,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                fontFamily: 'Inter_700Bold',
                color: '#fafafa',
                letterSpacing: 0.5,
              }}
            >
              START
            </Text>
          </View>
        </View>

        {/* Add button — top right */}
        <CardAddButton isSelected={isSelected} onToggle={onToggle} position="top-right" />

        {/* Text area */}
        <View style={{ padding: 10, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
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
              className="text-sm font-inter-bold text-content-primary"
              numberOfLines={1}
              style={{ flex: 1 }}
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
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(132,204,22,0.06)',
            }}
          />
        )}
      </Pressable>

      {/* Animated snake border */}
      <SnakeBorder isSelected={isSelected} borderRadius={BORDER_RADIUS} />
    </Animated.View>
  )
}
