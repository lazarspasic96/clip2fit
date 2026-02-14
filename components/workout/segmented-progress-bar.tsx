import { Pressable, View } from 'react-native'

interface SegmentedProgressBarProps {
  activeIndex: number
  total: number
  onPress?: (index: number) => void
}

export const SegmentedProgressBar = ({ activeIndex, total, onPress }: SegmentedProgressBarProps) => {
  return (
    <View className="flex-row gap-1">
      {Array.from({ length: total }, (_, i) => {
        const isReached = i <= activeIndex
        return (
          <Pressable
            key={i}
            onPress={() => onPress?.(i)}
            className={`flex-1 h-1.5 rounded-full ${isReached ? 'bg-brand-accent' : 'bg-content-primary'}`}
            hitSlop={6}
          />
        )
      })}
    </View>
  )
}
