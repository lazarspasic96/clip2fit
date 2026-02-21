import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { queryKeys } from '@/constants/query-keys'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useCatalogDetail } from '@/hooks/use-catalog'
import type { CatalogExerciseDetail } from '@/types/catalog'
import { apiGet } from '@/utils/api'

interface WorkoutExerciseInsights {
  catalogExercise: CatalogExerciseDetail | null
  isLoading: boolean
  videoUrl: string | null
}

export const useWorkoutExerciseInsights = (): WorkoutExerciseInsights => {
  const { session, currentExercise } = useActiveWorkout()
  const queryClient = useQueryClient()
  const activeCatalogId = currentExercise?.catalogExerciseId ?? null

  const { exercise, isLoading } = useCatalogDetail(activeCatalogId)

  useEffect(() => {
    if (session === null) return

    const indexesToPrefetch = [
      session.activeExerciseIndex - 1,
      session.activeExerciseIndex + 1,
    ]

    indexesToPrefetch.forEach((index) => {
      const nextExercise = session.plan.exercises[index]
      const catalogId = nextExercise?.catalogExerciseId
      if (catalogId === undefined || catalogId === null || catalogId.length === 0) return

      queryClient.prefetchQuery({
        queryKey: queryKeys.catalog.detail(catalogId),
        queryFn: () => apiGet<CatalogExerciseDetail>(`/api/exercises/catalog/${catalogId}`),
      })
    })
  }, [queryClient, session])

  return {
    catalogExercise: exercise,
    isLoading,
    videoUrl: currentExercise?.sourceVideoUrl ?? null,
  }
}
