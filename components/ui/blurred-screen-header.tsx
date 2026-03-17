import type { RefObject } from 'react'

import { BlurView } from 'expo-blur'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

export const BLURRED_SCREEN_HEADER_BAR_HEIGHT = 56

export const getBlurredScreenHeaderHeight = (topInset: number) => topInset + BLURRED_SCREEN_HEADER_BAR_HEIGHT

interface BlurredScreenHeaderProps {
  blurTarget?: RefObject<View | null>
  scrollY: SharedValue<number>
  title: string
}

export const BlurredScreenHeader = ({ blurTarget, scrollY, title }: BlurredScreenHeaderProps) => {
  const insets = useSafeAreaInsets()
  const headerHeight = getBlurredScreenHeaderHeight(insets.top)
  const isAndroid = Platform.OS === 'android'
  const shouldRenderBlur = !isAndroid || blurTarget != null

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 18], [0, 1], Extrapolation.CLAMP),
  }))
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: isAndroid ? 1 : interpolate(scrollY.value, [0, 18], [0, 1], Extrapolation.CLAMP),
  }))
  const dividerStyle = useAnimatedStyle(() => ({
    opacity: isAndroid ? 0 : interpolate(scrollY.value, [4, 20], [0, 1], Extrapolation.CLAMP),
  }))
  const leadingTitleStyle = useAnimatedStyle(() => ({
    opacity: isAndroid ? 1 : interpolate(scrollY.value, [0, 22], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: isAndroid ? 0 : interpolate(scrollY.value, [0, 22], [0, -6], Extrapolation.CLAMP),
      },
    ],
  }))
  const centeredTitleStyle = useAnimatedStyle(() => ({
    opacity: isAndroid ? 1 : interpolate(scrollY.value, [24, 56], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: isAndroid ? 0 : interpolate(scrollY.value, [24, 56], [8, 0], Extrapolation.CLAMP),
      },
    ],
  }))

  return (
    <View
      pointerEvents="none"
      className="absolute left-0 right-0 top-0 z-20 overflow-hidden"
      style={{ height: headerHeight }}
    >
      {shouldRenderBlur ? (
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
          <BlurView
            intensity={90}
            tint="systemChromeMaterialDark"
            blurMethod={isAndroid ? 'dimezisBlurViewSdk31Plus' : 'dimezisBlurView'}
            blurTarget={blurTarget}
            blurReductionFactor={isAndroid ? 6 : undefined}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}

      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          overlayStyle,
          {
            backgroundColor: isAndroid ? 'rgba(9,9,11,0.28)' : 'rgba(9,9,11,0.34)',
          },
        ]}
      />

      <View
        className="justify-center px-5"
        style={{
          paddingTop: insets.top,
          height: headerHeight,
        }}
      >
        {isAndroid ? (
          <Text className="text-2xl font-inter-bold text-content-primary">{title}</Text>
        ) : (
          <>
            <Animated.View className="justify-center" style={leadingTitleStyle}>
              <Text className="text-2xl font-inter-bold text-content-primary">{title}</Text>
            </Animated.View>
            <Animated.View
              className="absolute left-0 right-0 items-center justify-center"
              style={[
                {
                  top: insets.top,
                  height: BLURRED_SCREEN_HEADER_BAR_HEIGHT,
                },
                centeredTitleStyle,
              ]}
            >
              <Text className="text-lg font-inter-bold text-content-primary">{title}</Text>
            </Animated.View>
          </>
        )}
      </View>

      <Animated.View
        className="absolute bottom-0 left-5 right-5"
        style={[
          {
            height: StyleSheet.hairlineWidth,
            backgroundColor: 'rgba(63,63,70,0.7)',
          },
          dividerStyle,
        ]}
      />
    </View>
  )
}
