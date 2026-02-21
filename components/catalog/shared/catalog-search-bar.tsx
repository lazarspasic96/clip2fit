import { Search, X } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, TextInput } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

import { Colors } from '@/constants/colors'

interface CatalogSearchBarProps {
  value: string
  onChangeText: (text: string) => void
}

const SPRING = { damping: 18, stiffness: 220 }

export const CatalogSearchBar = ({ value, onChangeText }: CatalogSearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const focusProgress = useSharedValue(0)

  const handleFocus = () => {
    setIsFocused(true)
    focusProgress.value = withSpring(1, SPRING)
  }

  const handleBlur = () => {
    setIsFocused(false)
    focusProgress.value = withSpring(0, SPRING)
  }

  const handleClear = () => {
    onChangeText('')
  }

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: focusProgress.value > 0.5 ? Colors.brand.accent : Colors.border.primary,
  }))

  const clearScale = useSharedValue(value.length > 0 ? 1 : 0)

  clearScale.value = withTiming(value.length > 0 ? 1 : 0, { duration: 150 })

  const clearStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clearScale.value }],
    opacity: clearScale.value,
  }))

  const searchIconStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value > 0.5 ? 1 : 0.6,
  }))

  return (
    <Animated.View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 14,
          borderCurve: 'continuous',
          borderWidth: 1,
          backgroundColor: Colors.background.secondary,
          paddingHorizontal: 14,
          height: 48,
          gap: 10,
        },
        borderStyle,
      ]}
    >
      <Animated.View style={searchIconStyle}>
        <Search
          size={18}
          color={isFocused ? Colors.brand.accent : Colors.content.tertiary}
          pointerEvents="none"
        />
      </Animated.View>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search exercises..."
        placeholderTextColor={Colors.content.tertiary}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          flex: 1,
          fontSize: 15,
          fontFamily: 'Inter_400Regular',
          color: Colors.content.primary,
          padding: 0,
        }}
      />

      <Animated.View style={clearStyle}>
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            backgroundColor: Colors.background.tertiary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={12} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}
