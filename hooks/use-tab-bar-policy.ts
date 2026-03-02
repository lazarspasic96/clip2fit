import { isLiquidGlassAvailable } from 'expo-glass-effect'
import { useEffect, useState } from 'react'
import { AccessibilityInfo, Platform } from 'react-native'
import type { NativeTabsBlurEffect, NativeTabsTabBarMinimizeBehavior } from 'expo-router/unstable-native-tabs'

import { Colors } from '@/constants/colors'

const IS_IOS = Platform.OS === 'ios'
const IS_ANDROID = Platform.OS === 'android'
const LIQUID_AVAILABLE = IS_IOS && isLiquidGlassAvailable()

export interface TabBarPolicy {
  useExpoBlurTabsFallback: boolean
  disableScrollEdgeTransparency: boolean
  minimizeBehavior?: NativeTabsTabBarMinimizeBehavior
  blurEffect?: NativeTabsBlurEffect
  backgroundColor: string
}

export const useTabBarPolicy = (): TabBarPolicy => {
  const [reduceTransparency, setReduceTransparency] = useState(false)

  useEffect(() => {
    let active = true

    const fetchInitial = async () => {
      try {
        const enabled = await AccessibilityInfo.isReduceTransparencyEnabled()
        if (active) setReduceTransparency(enabled)
      } catch {
        // Platform does not expose this setting — keep default.
      }
    }

    fetchInitial()

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    )

    return () => {
      active = false
      subscription.remove()
    }
  }, [])

  const shouldUseLiquid = LIQUID_AVAILABLE && !reduceTransparency
  const shouldForceOpaqueForAccessibility = IS_IOS && reduceTransparency
  const shouldUseBlurFallback = IS_IOS && !shouldUseLiquid && !shouldForceOpaqueForAccessibility
  const useExpoBlurTabsFallback = IS_ANDROID || (IS_IOS && !LIQUID_AVAILABLE && !reduceTransparency)
  const backgroundColor = (() => {
    if (IS_ANDROID) {
      // Transparent so expo-blur BlurView is visible behind tab bar.
      return 'transparent'
    }

    if (IS_IOS && shouldUseBlurFallback) {
      // Transparent background is required so native tab blur is visible on older iOS.
      return 'transparent'
    }

    if (shouldForceOpaqueForAccessibility) {
      return Colors.background.secondary
    }

    if (shouldUseLiquid) {
      return 'transparent'
    }

    return Colors.background.secondary
  })()

  return {
    useExpoBlurTabsFallback,
    disableScrollEdgeTransparency: IS_IOS,
    minimizeBehavior: shouldUseLiquid ? 'onScrollDown' : undefined,
    blurEffect: shouldUseBlurFallback ? 'systemChromeMaterialDark' : undefined,
    backgroundColor,
  }
}
