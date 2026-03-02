import type { ApiExercise } from '@/types/api'
import type { CatalogExercise } from '@/types/catalog'

let counter = 0

const tempId = (): string => {
  counter += 1
  return `new-${Date.now()}-${counter}`
}

export const mapCatalogToApiExercise = (catalog: CatalogExercise, order: number): ApiExercise => ({
  id: tempId(),
  name: catalog.name,
  sets: 3,
  reps: '10',
  targetWeight: null,
  restBetweenSets: null,
  notes: null,
  order,
  muscleGroups: [catalog.target, ...catalog.secondaryMuscles].filter((m) => m.length > 0),
  isBodyweight: catalog.equipment === 'body weight',
  catalogExerciseId: catalog.id,
})
