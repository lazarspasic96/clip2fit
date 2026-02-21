import * as Haptics from 'expo-haptics'
import { Pressable, ScrollView, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

import {
  MUSCLE_GROUPS_ORDERED,
  MUSCLE_GROUP_LABELS,
  REGION_BREAK_INDICES,
} from '@/types/catalog'

interface CatalogFilterChipsProps {
  selectedMuscle: string | null
  onSelectMuscle: (muscle: string | null) => void
}

const SPRING_CONFIG = { damping: 15, stiffness: 300 }

const AnimatedChip = ({
  label,
  isActive,
  onPress,
}: {
  label: string
  isActive: boolean
  onPress: () => void
}) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.93, SPRING_CONFIG)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, SPRING_CONFIG)
  }

  const handlePress = () => {
    Haptics.selectionAsync()
    onPress()
  }

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={
          isActive
            ? 'bg-brand-accent rounded-full px-3.5 py-1.5'
            : 'bg-background-tertiary rounded-full px-3.5 py-1.5'
        }
      >
        <Text
          className={
            isActive
              ? 'text-sm font-inter-semibold text-background-primary'
              : 'text-sm font-inter text-content-secondary'
          }
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

export const CatalogFilterChips = ({
  selectedMuscle,
  onSelectMuscle,
}: CatalogFilterChipsProps) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 20 }}
    >
      {/* "All" chip */}
      <AnimatedChip
        label="All"
        isActive={selectedMuscle === null}
        onPress={() => onSelectMuscle(null)}
      />

      {/* Muscle group chips with region gaps */}
      {MUSCLE_GROUPS_ORDERED.map((muscle, index) => {
        const isActive = selectedMuscle === muscle
        const prevIndex = index - 1
        const gapAfterPrev = prevIndex >= 0 && REGION_BREAK_INDICES.has(prevIndex)
        const marginLeft = gapAfterPrev ? 12 : 8

        return (
          <View key={muscle} style={{ marginLeft }}>
            <AnimatedChip
              label={MUSCLE_GROUP_LABELS[muscle] ?? muscle}
              isActive={isActive}
              onPress={() => onSelectMuscle(isActive ? null : muscle)}
            />
          </View>
        )
      })}
    </ScrollView>
  )
}
