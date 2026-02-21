import { useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'
import { StyleSheet, View } from 'react-native'
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated'
import { Path, Svg } from 'react-native-svg'

import { Colors } from '@/constants/colors'

const AnimatedPath = Animated.createAnimatedComponent(Path)

interface SnakeBorderProps {
  isSelected: boolean
  borderRadius: number
}

// Rounded rect starting from top-right corner, drawn clockwise
const roundedRectPath = (x: number, y: number, w: number, h: number, r: number): string =>
  [
    `M ${x + w - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
    'Z',
  ].join(' ')

// 4 straight sides + 4 quarter-circle arcs
const getPerimeter = (w: number, h: number, r: number): number =>
  2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r

const STROKE_WIDTH = 2.5

export const SnakeBorder = ({ isSelected, borderRadius }: SnakeBorderProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })
  const progress = useSharedValue(isSelected ? 1 : 0)

  progress.value = withTiming(isSelected ? 1 : 0, {
    duration: isSelected ? 600 : 300,
    easing: isSelected ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
  })

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    if (width !== size.width || height !== size.height) {
      setSize({ width, height })
    }
  }

  const inset = STROKE_WIDTH / 2
  const pathW = size.width - STROKE_WIDTH
  const pathH = size.height - STROKE_WIDTH
  const r = Math.max(borderRadius - inset, 1)
  const totalLen = getPerimeter(pathW, pathH, r)
  const d = roundedRectPath(inset, inset, pathW, pathH, r)

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: totalLen * (1 - progress.value),
  }))

  return (
    <View style={StyleSheet.absoluteFill} onLayout={handleLayout} pointerEvents="none">
      {size.width > 0 && size.height > 0 && (
        <Svg width={size.width} height={size.height} style={StyleSheet.absoluteFill}>
          <AnimatedPath
            d={d}
            stroke={Colors.brand.accent}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${totalLen}`}
            strokeLinecap="round"
            animatedProps={animatedProps}
          />
        </Svg>
      )}
    </View>
  )
}
