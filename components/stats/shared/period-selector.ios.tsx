import * as Haptics from 'expo-haptics'

import { Host, Picker, Text } from '@expo/ui/swift-ui'
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers'

import type { StatsPeriod } from '@/types/stats'
import { PERIOD_OPTIONS } from '@/types/stats'

interface PeriodSelectorProps {
  period: StatsPeriod
  onChange: (period: StatsPeriod) => void
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  const handleSelectionChange = (nextPeriod: StatsPeriod) => {
    if (nextPeriod === period) return
    void Haptics.selectionAsync()
    onChange(nextPeriod)
  }

  return (
    <Host
      matchContents={{ vertical: true }}
      colorScheme="dark"
      style={{ width: '100%' }}
    >
      <Picker<StatsPeriod>
        label="Period"
        selection={period}
        onSelectionChange={handleSelectionChange}
        modifiers={[pickerStyle('segmented')]}
      >
        {PERIOD_OPTIONS.map((option) => (
          <Text key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </Host>
  )
}
