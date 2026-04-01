import { useQuery } from '@tanstack/react-query'

import { apiGet } from '@/utils/api'
import { ApiError } from '@/utils/api'
import { queryKeys } from '@/constants/query-keys'

export type ExerciseHistoryResponse = Record<string, {
  sessionCount: number
  lastSession: {
    sets: Array<{
      setNumber: number
      actualWeight: number | null
      actualReps: number | null
    }>
  }
}>

interface UseSmartTargetsHistoryResult {
  history: ExerciseHistoryResponse
  isLoading: boolean
  error: string | null
}

export const useSmartTargetsHistory = (catalogExerciseIds: string[]): UseSmartTargetsHistoryResult => {
  const dedupedIds = [...new Set(catalogExerciseIds)].sort()
  const idsParam = dedupedIds.join(',')

  const query = useQuery({
    queryKey: queryKeys.stats.exerciseHistoryBulk(dedupedIds),
    queryFn: () => apiGet<ExerciseHistoryResponse>(`/api/stats/exercise-history?ids=${idsParam}`),
    enabled: dedupedIds.length > 0,
    staleTime: 5 * 60 * 1000,
  })

  return {
    history: query.data ?? {},
    isLoading: query.isLoading,
    error: query.error instanceof ApiError
      ? query.error.message
      : query.error !== null
        ? 'Failed to load exercise history'
        : null,
  }
}
