import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  ApiConvertResponse,
  ApiJob,
  ApiWorkout,
  PatchWorkoutPayload,
} from '@/types/api'
import { mapApiWorkout, mapProfileToApi } from '@/types/api'
import type { UserProfile } from '@/types/profile'
import type { WorkoutPlan } from '@/types/workout'
import { apiDelete, ApiError, apiGet, apiPatch, apiPost } from '@/utils/api'
import { queryKeys } from '@/constants/query-keys'

// --- useConvertUrlMutation ---

const TAG = '[use-api]'

export const useConvertUrlMutation = () =>
  useMutation({
    mutationFn: async (url: string) => {
      console.log(TAG, 'convertMutation — calling /api/convert with url:', url)
      const result = await apiPost<ApiConvertResponse>('/api/convert', { url })
      console.log(TAG, 'convertMutation — response:', JSON.stringify(result))
      return result
    },
    onError: (error) => {
      console.error(TAG, 'convertMutation — onError:', error instanceof ApiError ? `ApiError(${error.status}): ${error.message}` : String(error))
    },
  })

// --- useJobPolling (stays imperative — not a good TQ fit) ---

const JOB_POLL_INTERVAL = 2000

interface UseJobPollingReturn {
  status: ApiJob['status'] | null
  progress: number
  workoutId: string | null
  error: string | null
  stop: () => void
}

export const useJobPolling = (jobId: string | null): UseJobPollingReturn => {
  const [status, setStatus] = useState<ApiJob['status'] | null>(null)
  const [progress, setProgress] = useState(0)
  const [workoutId, setWorkoutId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = () => {
    console.log(TAG, 'jobPolling — stop() called')
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  useEffect(() => {
    console.log(TAG, 'jobPolling — effect fired, jobId:', jobId)
    if (jobId === null) return

    let active = true

    const poll = async () => {
      try {
        console.log(TAG, `jobPolling — polling /api/jobs/${jobId}`)
        const job = await apiGet<ApiJob>(`/api/jobs/${jobId}`)
        if (!active) return

        console.log(TAG, `jobPolling — status=${job.status}, progress=${job.progress}, workoutId=${job.workoutId}`)
        setStatus(job.status)
        setProgress(job.progress)

        if (job.status === 'completed' && job.workoutId !== null) {
          console.log(TAG, 'jobPolling — completed! workoutId:', job.workoutId)
          setWorkoutId(job.workoutId)
          stop()
        } else if (job.status === 'failed') {
          console.error(TAG, 'jobPolling — failed:', job.error)
          setError(job.error ?? 'Conversion failed')
          stop()
        }
      } catch (err: unknown) {
        if (!active) return
        const message = err instanceof ApiError ? err.message : 'Failed to check job status'
        console.error(TAG, 'jobPolling — poll error:', message, err)
        setError(message)
        stop()
      }
    }

    poll()
    intervalRef.current = setInterval(poll, JOB_POLL_INTERVAL)

    return () => {
      active = false
      stop()
    }
  }, [jobId])

  return { status, progress, workoutId, error, stop }
}

// --- useWorkoutQuery ---

interface WorkoutQueryResult {
  workout: WorkoutPlan | null
  rawWorkout: ApiWorkout | null
  isLoading: boolean
  error: string | null
}

export const useWorkoutQuery = (id: string | null): WorkoutQueryResult => {
  const query = useQuery({
    queryKey: queryKeys.workouts.detail(id ?? ''),
    queryFn: () => apiGet<ApiWorkout>(`/api/workouts/${id}`),
    enabled: id !== null && id.length > 0,
  })

  return {
    workout: query.data !== undefined ? mapApiWorkout(query.data) : null,
    rawWorkout: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof ApiError ? query.error.message : query.error !== null ? 'Failed to load workout' : null,
  }
}

// --- useWorkoutsQuery ---

interface WorkoutsQueryResult {
  workouts: WorkoutPlan[]
  isLoading: boolean
  error: string | null
  isRefetching: boolean
  refetch: () => void
}

export const useWorkoutsQuery = (): WorkoutsQueryResult => {
  const query = useQuery({
    queryKey: queryKeys.workouts.all,
    queryFn: () => apiGet<ApiWorkout[]>('/api/workouts'),
  })

  return {
    workouts: query.data !== undefined ? query.data.map(mapApiWorkout) : [],
    isLoading: query.isLoading,
    error: query.error instanceof ApiError ? query.error.message : query.error !== null ? 'Failed to load workouts' : null,
    isRefetching: query.isRefetching,
    refetch: () => { query.refetch() },
  }
}

// --- useSaveProfileMutation ---

export const useSaveProfileMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (profile: Partial<UserProfile>) => apiPatch('/api/profiles', mapProfileToApi(profile)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.current })
    },
  })
}

// --- useUpdateWorkoutMutation ---

export const useUpdateWorkoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PatchWorkoutPayload }) =>
      apiPatch<ApiWorkout>(`/api/workouts/${id}`, payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(variables.id) })

      // Fork-on-edit: shared template was cloned into personal copy
      if (data.id !== variables.id) {
        queryClient.invalidateQueries({ queryKey: queryKeys.workouts.detail(data.id) })
        queryClient.invalidateQueries({ queryKey: queryKeys.schedule.current })
      }
    },
  })
}

// --- useDeleteWorkoutMutation ---

export const useDeleteWorkoutMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/api/workouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workouts.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.schedule.current })
    },
  })
}

