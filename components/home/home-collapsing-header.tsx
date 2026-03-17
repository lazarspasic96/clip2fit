import { Image } from 'expo-image'
import { BlurView } from 'expo-blur'
import type { RefObject } from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated'

export const HOME_COLLAPSING_HEADER_BAR_HEIGHT = 64

interface HomeCollapsingHeaderProps {
  avatarUrl?: string
  blurTarget?: RefObject<View | null>
  displayName: string
  initials: string
  scrollY: SharedValue<number>
  subtitle: string
}

export const HomeCollapsingHeader = ({
  avatarUrl,
  blurTarget,
  displayName,
  initials,
  scrollY,
  subtitle,
}: HomeCollapsingHeaderProps) => {
  const insets = useSafeAreaInsets()
  const headerHeight = insets.top + HOME_COLLAPSING_HEADER_BAR_HEIGHT
  const isAndroid = Platform.OS === 'android'
  const shouldRenderBlur = !isAndroid || blurTarget != null

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [8, 56], [0, 1], Extrapolation.CLAMP),
  }))
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [8, 56], [0, 1], Extrapolation.CLAMP),
  }))
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [20, 72], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [20, 72], [8, 0], Extrapolation.CLAMP),
      },
    ],
  }))
  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [20, 72], [0, 1], Extrapolation.CLAMP),
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

      <Animated.View
        className="flex-row items-center gap-3 px-5"
        style={[
          {
            paddingTop: insets.top,
            height: headerHeight,
          },
          contentStyle,
        ]}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={{ width: 34, height: 34, borderRadius: 17 }} />
        ) : (
          <View
            className="items-center justify-center rounded-full bg-background-tertiary"
            style={{ width: 34, height: 34 }}
          >
            <Text className="text-xs font-inter-semibold text-content-primary">{initials}</Text>
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-inter-bold text-content-primary" numberOfLines={1}>
            {displayName}
          </Text>
          <Text className="text-xs font-inter text-content-secondary" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </Animated.View>

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
