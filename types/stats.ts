export type StatsPeriod = '7d' | '30d' | '6m' | '1y' | 'all'

export interface ApiPRTimelinePoint {
  date: string
  weight: number
  reps: number
  previous_weight: number | null
  session_id: string
}

export interface ApiPRExercise {
  catalog_exercise_id: string | null
  exercise_name: string
  current_pr: number
  pr_timeline: ApiPRTimelinePoint[]
}

export interface ApiPRsResponse {
  exercises: ApiPRExercise[]
  total_pr_count: number
}

export interface StatsWeeklyFrequencyPoint {
  week: string
  sessions: number
  volume: number
}

export interface StatsTopExercise {
  catalogExerciseId: string | null
  exerciseName: string
  sessionCount: number
  primaryMuscleGroup?: string | null
}

export interface StatsMuscleGroupDistributionPoint {
  muscleGroup: string
  sessionCount: number
  percentage: number
}

export interface StatsSummary {
  totalSessions: number
  completedSessions: number
  partialSessions: number
  avgDurationSeconds: number
  totalVolume: number
  currentStreakWeeks: number
  bestStreakWeeks: number
  weeklyFrequency: StatsWeeklyFrequencyPoint[]
  topExercises: StatsTopExercise[]
  muscleGroupDistribution: StatsMuscleGroupDistributionPoint[]
}

export interface StatsPRTimelinePoint {
  date: string
  weight: number
  reps: number
  previousWeight: number | null
  sessionId: string
}

export interface StatsPRExercise {
  catalogExerciseId: string | null
  exerciseName: string
  currentPr: number
  prTimeline: StatsPRTimelinePoint[]
}

export interface StatsPRs {
  exercises: StatsPRExercise[]
  totalPrCount: number
}

export const PERIOD_OPTIONS: { label: string; value: StatsPeriod }[] = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'ALL', value: 'all' },
]

export const formatMuscleLabel = (label: string) =>
  label
    .split('_')
    .join(' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
