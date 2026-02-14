import type {
  DayOfWeek,
  DayStatus,
  ScheduleEntry,
  UpsertSchedulePayload,
  WeekDay,
  WeeklySchedule,
} from '@/types/schedule'

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: 'Monday',
  1: 'Tuesday',
  2: 'Wednesday',
  3: 'Thursday',
  4: 'Friday',
  5: 'Saturday',
  6: 'Sunday',
}

export const DAY_SHORT_LABELS: Record<DayOfWeek, string> = {
  0: 'Mon',
  1: 'Tue',
  2: 'Wed',
  3: 'Thu',
  4: 'Fri',
  5: 'Sat',
  6: 'Sun',
}

// JS Date.getDay(): 0=Sun, 1=Mon, ... 6=Sat → convert to 0=Mon, ..., 6=Sun
export const getTodayDayOfWeek = (): DayOfWeek => {
  const jsDay = new Date().getDay()
  return ((jsDay + 6) % 7) as DayOfWeek
}

const buildEmptyEntry = (dayOfWeek: DayOfWeek): ScheduleEntry => ({
  dayOfWeek,
  workoutId: null,
  isRestDay: false,
  workout: null,
})

export const buildEmptySchedule = (): WeeklySchedule => ({
  entries: Array.from({ length: 7 }, (_, i) => buildEmptyEntry(i as DayOfWeek)),
})

export const scheduleToPayload = (schedule: WeeklySchedule): UpsertSchedulePayload => ({
  entries: schedule.entries.map((e) => ({
    day_of_week: e.dayOfWeek,
    workout_id: e.workoutId,
    is_rest_day: e.isRestDay,
  })),
})

export const buildWeekDaysFromSchedule = (
  schedule: WeeklySchedule,
  completedWorkoutId?: string | null,
): WeekDay[] => {
  const today = getTodayDayOfWeek()
  const now = new Date()
  // Get Monday of the current week
  const jsDay = now.getDay()
  const mondayOffset = (jsDay + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)

  return schedule.entries.map((entry, i) => {
    const dayOfWeek = i as DayOfWeek
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + i)

    let status: DayStatus
    if (
      dayOfWeek === today &&
      completedWorkoutId !== undefined &&
      completedWorkoutId !== null &&
      entry.workoutId === completedWorkoutId
    ) {
      status = 'completed'
    } else if (dayOfWeek === today) {
      status = entry.workoutId !== null ? 'active' : 'activeRest'
    } else if (entry.workoutId !== null) {
      status = 'scheduled'
    } else {
      status = 'future'
    }

    return {
      label: DAY_SHORT_LABELS[dayOfWeek],
      date: dayDate.getDate(),
      workoutLabel: entry.workout?.title,
      status,
    }
  })
}

export const getScheduleStats = (
  schedule: WeeklySchedule,
): { trainingDays: number; restDays: number; muscles: string[] } => {
  let trainingDays = 0
  const muscleSet = new Set<string>()

  for (const entry of schedule.entries) {
    if (entry.workoutId !== null) {
      trainingDays++
      if (entry.workout?.targetMuscles !== undefined) {
        for (const m of entry.workout.targetMuscles) {
          muscleSet.add(m)
        }
      }
    }
  }

  return { trainingDays, restDays: 7 - trainingDays, muscles: [...muscleSet] }
}
