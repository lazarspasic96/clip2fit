import type { ApiWorkout } from '@/types/api'
import type { WorkoutPlan } from '@/types/workout'

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type DayStatus = 'completed' | 'skipped' | 'active' | 'activeRest' | 'scheduled' | 'future' | 'rest'

export interface WeekDay {
  label: string
  date: number
  workoutLabel?: string
  status: DayStatus
}

// API response (snake_case — matches backend)
export interface ApiScheduleEntry {
  id: string
  day_of_week: DayOfWeek
  workout_id: string | null
  is_rest_day: boolean
  workout: ApiWorkout | null
  created_at: string
  updated_at: string
}

// Frontend (camelCase)
export interface ScheduleEntry {
  dayOfWeek: DayOfWeek
  workoutId: string | null
  isRestDay: boolean
  workout: WorkoutPlan | null
}

export interface WeeklySchedule {
  entries: ScheduleEntry[] // always 7 items, index = dayOfWeek
}

export interface UpsertSchedulePayload {
  entries: Array<{ day_of_week: DayOfWeek; workout_id: string | null; is_rest_day: boolean }>
}
