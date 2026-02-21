import { useCatalogDetail } from '@/hooks/use-catalog'
import type { CatalogExerciseDetail } from '@/types/catalog'

interface ExerciseCatalogResult {
  catalogExercise: CatalogExerciseDetail | null
  isLoading: boolean
}

export const useExerciseCatalog = (catalogExerciseId: string | null): ExerciseCatalogResult => {
  const { exercise, isLoading } = useCatalogDetail(catalogExerciseId)
  return { catalogExercise: exercise, isLoading }
}
