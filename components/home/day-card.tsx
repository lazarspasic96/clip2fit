import { Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { type DayStatus, type WeekDay } from '@/utils/mock-data'

import { StatusIndicator } from './status-indicator'

const STATUS_STYLES: Record<DayStatus, { card: string; text: string }> = {
  completed: {
    card: 'bg-background-tertiary border-border-primary',
    text: 'text-content-secondary',
  },
  skipped: {
    card: 'bg-background-tertiary border-border-primary',
    text: 'text-content-secondary',
  },
  active: {
    card: 'bg-background-tertiary border-brand-logo',
    text: 'text-content-primary',
  },
  activeRest: {
    card: 'bg-background-tertiary border-brand-logo',
    text: 'text-content-primary',
  },
  future: {
    card: 'bg-background-secondary border-border-primary',
    text: 'text-content-secondary',
  },
  rest: {
    card: 'bg-background-secondary border-border-primary',
    text: 'text-content-secondary',
  },
}

export const DayCard = ({ day }: { day: WeekDay }) => {
  const styles = STATUS_STYLES[day.status]
  const displayLabel = day.status === 'rest' || day.status === 'activeRest' ? 'Rest' : day.workoutLabel

  return (
    <View
      className={cn('flex-1 items-center rounded-xs border p-2 justify-between', styles.card)}
      style={{ height: 80 }}
    >
      <View className="items-center">
        <Text className={cn('text-xs font-inter-semibold', styles.text)}>{day.label}</Text>
        <Text className={cn('text-xs font-inter', styles.text)}>{day.date}</Text>
      </View>

      <View className="items-center gap-1">
        <StatusIndicator status={day.status} />
        {displayLabel ? (
          <Text className={cn('text-xs font-inter', styles.text)} numberOfLines={1}>
            {displayLabel}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
