import { useEffect } from 'react'
import { Pressable, Text, View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { CircleCheck } from 'lucide-react-native'

import { Colors } from '@/constants/colors'
import { PlatformBadge } from '@/components/processing/platform-badge'
import type { SupportedPlatform } from '@/utils/url-validation'

const SIZE = 120
const STROKE_WIDTH = 6
const RADIUS = (SIZE - STROKE_WIDTH) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface AlreadyConvertedViewProps {
  platform: SupportedPlatform
  sourceUrl: string
  onViewInLibrary: () => void
  onGoBack: () => void
}

export const AlreadyConvertedView = ({
  platform,
  sourceUrl,
  onViewInLibrary,
  onGoBack,
}: AlreadyConvertedViewProps) => {
  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  }, [])

  const truncatedUrl =
    sourceUrl.length > 50 ? `${sourceUrl.slice(0, 50)}...` : sourceUrl

  return (
    <View className="flex-1 items-center px-6" style={{ paddingTop: 60 }}>
      {/* Hero ring — full green, platform badge centered */}
      <Animated.View
        entering={FadeIn.duration(300)}
        style={{ width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Radial glow */}
        <View
          style={{
            position: 'absolute',
            width: 200,
            height: 200,
            borderRadius: 100,
            experimental_backgroundImage:
              'radial-gradient(circle, rgba(132,204,22,0.08) 0%, transparent 70%)',
          }}
          pointerEvents="none"
        />

        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          {/* Full green ring */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.brand.accent}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
        </Svg>

        <PlatformBadge platform={platform} size={32} />

        {/* Check overlay at bottom-right */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 4,
            backgroundColor: Colors.background.primary,
            borderRadius: 14,
          }}
        >
          <CircleCheck
            size={28}
            color={Colors.brand.accent}
            fill={Colors.brand.accent}
            stroke={Colors.background.primary}
            pointerEvents="none"
          />
        </View>
      </Animated.View>

      {/* Message block */}
      <View style={{ marginTop: 32, alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Inter_600SemiBold',
            color: Colors.content.primary,
            textAlign: 'center',
          }}
        >
          Already in your library
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontFamily: 'Inter_400Regular',
            color: Colors.content.tertiary,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          You&apos;ve converted this video before.{'\n'}Check your workout library.
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontFamily: 'Inter_400Regular',
            color: Colors.content.tertiary,
            maxWidth: 280,
          }}
        >
          {truncatedUrl}
        </Text>
      </View>

      {/* CTAs */}
      <Animated.View
        entering={FadeInUp.delay(200).duration(300)}
        style={{ marginTop: 40, width: '100%', gap: 16, alignItems: 'center' }}
      >
        <Pressable
          onPress={onViewInLibrary}
          className="w-full items-center justify-center rounded-[14px] py-4"
          style={{ backgroundColor: Colors.brand.accent }}
        >
          <Text
            style={{
              fontSize: 16,
              fontFamily: 'Inter_600SemiBold',
              color: Colors.background.primary,
            }}
          >
            View in Library
          </Text>
        </Pressable>

        <Pressable onPress={onGoBack} hitSlop={12}>
          <Text
            style={{
              fontSize: 14,
              fontFamily: 'Inter_500Medium',
              color: Colors.content.secondary,
            }}
          >
            Convert a different video
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}
