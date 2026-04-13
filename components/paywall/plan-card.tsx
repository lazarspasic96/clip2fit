import type { SubscriptionPlan } from '@/types/subscription'
import { Colors } from '@/constants/colors'
import { Pressable, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'

interface PlanCardProps {
  plan: SubscriptionPlan
  label: string
  price: string
  period: string
  trial?: string
  tag?: string
  selected: boolean
  onPress: () => void
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export const PlanCard = ({ label, price, period, trial, tag, selected, onPress }: PlanCardProps) => {
  const scale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 })
  }

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          borderWidth: 1.5,
          borderColor: selected ? Colors.brand.accent : Colors.border.primary,
          backgroundColor: selected ? 'rgba(132, 204, 22, 0.04)' : 'transparent',
          borderRadius: 14,
          padding: 15,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        },
      ]}
    >
      {/* Radio */}
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? Colors.brand.accent : Colors.border.secondary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {selected && (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: Colors.brand.accent,
            }}
          />
        )}
      </View>

      {/* Plan info */}
      <View style={{ flex: 1 }}>
        <Text className="text-[15px] font-inter-semibold text-content-primary">{label}</Text>
        <Text className="text-[13px] font-inter text-content-secondary mt-px">
          {price}{period}
        </Text>
        {trial !== undefined && (
          <Text style={{ fontSize: 12, fontWeight: '500', color: Colors.brand.logo, marginTop: 2 }}>
            {trial}
          </Text>
        )}
      </View>

      {/* Tag */}
      {tag !== undefined && (
        <View
          style={{
            backgroundColor: Colors.brand.accent,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: Colors.background.primary }}>
            {tag}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  )
}
