import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type {
  StatsPRExercise,
  StatsPRs,
  StatsPeriod,
} from '@/types/stats'
import {
  mapPRHistoryResponse,
  mapPRsResponse,
  mapSummaryResponse,
} from '@/types/stats'
import { ApiError, apiGet } from '@/utils/api'
import {
  appendTimezoneDebugOverride,
} from '@/utils/timezone-observability'

const getSummaryPath = (period: StatsPeriod) => {
  const params = new URLSearchParams({ period })
  appendTimezoneDebugOverride(params)

  return `/api/stats/summary?${params.toString()}`
}

const getPRsPath = (catalogExerciseId?: string | null) => {
  const params = new URLSearchParams()

  if (catalogExerciseId !== undefined && catalogExerciseId !== null && catalogExerciseId.length > 0) {
    params.set('catalog_exercise_id', catalogExerciseId)
  }
  appendTimezoneDebugOverride(params)

  return params.size > 0 ? `/api/stats/prs?${params.toString()}` : '/api/stats/prs'
}

const getPRHistoryPath = (catalogExerciseId: string, period: StatsPeriod) => {
  const params = new URLSearchParams({ period })
  appendTimezoneDebugOverride(params)

  return `/api/stats/prs/${catalogExerciseId}/history?${params.toString()}`
}

const findExerciseByName = (exercises: StatsPRExercise[], exerciseName: string | null) => {
  if (exerciseName === null || exerciseName.length === 0) return null

  const normalized = exerciseName.trim().toLowerCase()

  return exercises.find((exercise) => exercise.exerciseName.trim().toLowerCase() === normalized) ?? null
}

export const useStatsSummary = (period: StatsPeriod) => {
  const query = useQuery({
    queryKey: queryKeys.stats.summary(period),
    queryFn: async () => {
      const path = getSummaryPath(period)
      const response = await apiGet<unknown>(path)
      return mapSummaryResponse(response)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  return {
    summary: query.data ?? null,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error instanceof ApiError ? query.error.message : query.error !== null ? 'Failed to load stats summary' : null,
    refetch: query.refetch,
  }
}

export const useStatsPRs = (catalogExerciseId?: string | null) => {
  const query = useQuery({
    queryKey: queryKeys.stats.prs(catalogExerciseId ?? null),
    queryFn: async () => {
      const path = getPRsPath(catalogExerciseId)
      const response = await apiGet<unknown>(path)
      return mapPRsResponse(response)
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })

  return {
    prs: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof ApiError ? query.error.message : query.error !== null ? 'Failed to load PR history' : null,
    refetch: query.refetch,
  }
}

export const useExerciseHistory = (catalogExerciseId: string | null, exerciseName: string | null, period: StatsPeriod) => {
  const query = useQuery({
    queryKey: queryKeys.stats.exerciseHistory(catalogExerciseId, exerciseName, period),
    queryFn: async () => {
      if (catalogExerciseId !== null && catalogExerciseId.length > 0) {
        const path = getPRHistoryPath(catalogExerciseId, period)
        const response = await apiGet<unknown>(path)
        const mapped = mapPRHistoryResponse(response)
        return {
          exercises: mapped !== null ? [mapped] : [],
          totalPrCount: mapped !== null ? mapped.prTimeline.length : 0,
        } satisfies StatsPRs
      }

      if (exerciseName === null || exerciseName.length === 0) {
        return { exercises: [], totalPrCount: 0 } satisfies StatsPRs
      }

      const path = getPRsPath()
      const response = await apiGet<unknown>(path)
      const mapped = mapPRsResponse(response)
      const matched = findExerciseByName(mapped.exercises, exerciseName)

      return {
        exercises: matched !== null ? [matched] : [],
        totalPrCount: matched !== null ? matched.prTimeline.length : 0,
      } satisfies StatsPRs
    },
    enabled:
      (catalogExerciseId !== null && catalogExerciseId.length > 0) ||
      (exerciseName !== null && exerciseName.length > 0),
    staleTime: 10 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  })

  const history = useMemo(() => {
    if (query.data === undefined) return null
    return query.data.exercises[0] ?? null
  }, [query.data])

  return {
    history,
    isLoading: query.isLoading,
    error: query.error instanceof ApiError ? query.error.message : query.error !== null ? 'Failed to load exercise history' : null,
    refetch: query.refetch,
  }
}
