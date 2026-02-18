import { SegmentedControl } from '@/components/ui/segmented-control'
import type { StatsPeriod } from '@/types/stats'
import { PERIOD_OPTIONS } from '@/types/stats'

interface PeriodSelectorProps {
  period: StatsPeriod
  onChange: (period: StatsPeriod) => void
}

export const PeriodSelector = ({ period, onChange }: PeriodSelectorProps) => {
  return (
    <SegmentedControl
      options={PERIOD_OPTIONS}
      value={period}
      onChange={onChange}
    />
  )
}

