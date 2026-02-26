import { memo } from 'react'
import type { TextStyle, ViewStyle } from 'react-native'
import { Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { getMuscleChipColors, getMuscleLabel } from '@/utils/muscle-color'

type MuscleChipTone = 'soft' | 'solid' | 'ghost'
type MuscleChipSize = 'xs' | 'sm'

interface MuscleChipProps {
  muscle: string
  label?: string
  size?: MuscleChipSize
  tone?: MuscleChipTone
  maxWidth?: number
}

interface CachedChipStyle {
  containerStyle: ViewStyle
  textStyle: TextStyle
}

const chipStyleCache = new Map<string, CachedChipStyle>()

const getCachedStyle = (muscle: string, tone: MuscleChipTone): CachedChipStyle => {
  const key = `${muscle.toLowerCase().trim()}::${tone}`
  const cached = chipStyleCache.get(key)
  if (cached !== undefined) return cached

  const colors = getMuscleChipColors(muscle, tone)
  const next: CachedChipStyle = {
    containerStyle: {
      backgroundColor: colors.backgroundColor,
      borderColor: colors.borderColor,
      borderWidth: 1,
    },
    textStyle: {
      color: colors.textColor,
    },
  }

  chipStyleCache.set(key, next)
  return next
}

export const MuscleChip = memo(({
  muscle,
  label,
  size = 'xs',
  tone = 'soft',
  maxWidth,
}: MuscleChipProps) => {
  const resolvedLabel = label ?? getMuscleLabel(muscle)
  const cachedStyle = getCachedStyle(muscle, tone)

  return (
    <View
      className={cn(
        'rounded-full',
        size === 'xs' ? 'px-2.5 py-0.5' : 'px-3 py-1',
      )}
      style={[
        cachedStyle.containerStyle,
        maxWidth !== undefined ? { maxWidth } : null,
      ]}
    >
      <Text
        numberOfLines={1}
        className={cn(
          size === 'xs' ? 'text-xs font-inter-medium' : 'text-sm font-inter-medium',
        )}
        style={cachedStyle.textStyle}
      >
        {resolvedLabel}
      </Text>
    </View>
  )
})

MuscleChip.displayName = 'MuscleChip'
