import type { SetStatus } from '@/types/workout'
import { View } from 'react-native'

interface SetDotsProps {
  sets: { status: SetStatus }[]
  activeIndex: number
}

export const SetDots = ({ sets, activeIndex }: SetDotsProps) => {
  return (
    <View className="flex-row items-center gap-2">
      {sets.map((set, i) => {
        let dotClass = 'w-2.5 h-2.5 rounded-full '
        if (set.status === 'completed') {
          dotClass += 'bg-brand-accent'
        } else if (i === activeIndex) {
          dotClass += 'border border-brand-accent bg-transparent'
        } else if (set.status === 'skipped') {
          dotClass += 'bg-content-tertiary'
        } else {
          dotClass += 'bg-background-tertiary'
        }
        return <View key={i} className={dotClass} />
      })}
    </View>
  )
}
