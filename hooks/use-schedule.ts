import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type { ApiWorkout } from '@/types/api'
import { mapApiWorkout } from '@/types/api'
import type { ApiScheduleEntry, DayOfWeek, ScheduleEntry, UpsertSchedulePayload, WeeklySchedule } from '@/types/schedule'
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
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.schedule.current })
      const previous = queryClient.getQueryData<ApiScheduleEntry[]>(queryKeys.schedule.current)

      if (previous !== undefined) {
        const workoutsCache = queryClient.getQueryData<ApiWorkout[]>(queryKeys.workouts.all)
        const payloadMap = new Map(payload.entries.map((e) => [e.day_of_week, e]))

        const optimistic = previous.map((entry) => {
          const update = payloadMap.get(entry.day_of_week)
          if (update === undefined || update.workout_id === entry.workout_id) return entry
          return {
            ...entry,
            workout_id: update.workout_id,
            is_rest_day: update.is_rest_day,
            workout: update.workout_id !== null
              ? workoutsCache?.find((w) => w.id === update.workout_id) ?? null
              : null,
          }
        })

        queryClient.setQueryData(queryKeys.schedule.current, optimistic)
      }

      return { previous }
    },
    onError: (_err, _payload, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKeys.schedule.current, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.current })
    },
  })
}

export const useAssignScheduleDay = (schedule: WeeklySchedule) => {
  const mutation = useUpdateScheduleMutation()

  return (dayOfWeek: DayOfWeek, workoutId: string | null) => {
    mutation.mutate({
      entries: schedule.entries.map((e) => ({
        day_of_week: e.dayOfWeek,
        workout_id: e.dayOfWeek === dayOfWeek ? workoutId : e.workoutId,
        is_rest_day: e.dayOfWeek === dayOfWeek ? false : e.isRestDay,
      })),
    })
  }
}
