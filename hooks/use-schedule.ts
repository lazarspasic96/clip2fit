import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type { ApiScheduleEntry, DayOfWeek, ScheduleEntry, WeeklySchedule } from '@/types/schedule'
import type { UpsertSchedulePayload } from '@/types/schedule'
import { mapApiWorkout } from '@/types/api'
import { apiGet, apiPut } from '@/utils/api'
import { buildEmptySchedule } from '@/utils/schedule'

const mapApiScheduleEntry = (api: ApiScheduleEntry): ScheduleEntry => ({
  dayOfWeek: api.day_of_week,
  workoutId: api.workout_id,
  isRestDay: api.is_rest_day,
  workout: api.workout !== null ? mapApiWorkout(api.workout) : null,
})

const buildFullSchedule = (entries: ApiScheduleEntry[]): WeeklySchedule => {
  const base = buildEmptySchedule()
  for (const apiEntry of entries) {
    const mapped = mapApiScheduleEntry(apiEntry)
    base.entries[mapped.dayOfWeek] = mapped
  }
  return base
}

export const useScheduleQuery = () => {
  const query = useQuery({
    queryKey: queryKeys.schedule.current,
    queryFn: () => apiGet<ApiScheduleEntry[]>('/api/schedules'),
  })

  const schedule: WeeklySchedule =
    query.data !== undefined ? buildFullSchedule(query.data) : buildEmptySchedule()

  return {
    schedule,
    isLoading: query.isLoading,
    error: query.error !== null ? 'Failed to load schedule' : null,
  }
}

export const useUpdateScheduleMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpsertSchedulePayload) =>
      apiPut<ApiScheduleEntry[]>('/api/schedules', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.current })
    },
  })
}
