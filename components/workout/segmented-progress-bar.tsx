import type { ExerciseStatus } from '@/types/workout'
import { View } from 'react-native'

interface SegmentedProgressBarProps {
  segments: { status: ExerciseStatus }[]
}

const getSegmentBgClass = (status: ExerciseStatus): string => {
  if (status === 'completed') return 'bg-brand-accent'
  if (status === 'active') return 'bg-content-primary'
  if (status === 'skipped') return 'bg-content-tertiary'
  return 'bg-background-tertiary'
}

export const SegmentedProgressBar = ({ segments }: SegmentedProgressBarProps) => {
  return (
    <View className="flex-row gap-1">
      {segments.map((seg, i) => {
        const bgClass = getSegmentBgClass(seg.status)
        return <View key={i} className={`flex-1 h-1.5 rounded-full ${bgClass}`} />
      })}
    </View>
  )
}
