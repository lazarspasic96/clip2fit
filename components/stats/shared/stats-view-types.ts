import type { StatsSummary, StatsTopExercise } from '@/types/stats'

export interface StatsOverviewProps {
  summary: StatsSummary
  onPressExercise: (exercise: StatsTopExercise) => void
}

