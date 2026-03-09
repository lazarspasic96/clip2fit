import type { CatalogExercise } from '@/types/catalog'

export type AddExercisesCaller = 'workout-detail' | 'workout-proposal'

export interface AddExercisesRequestInput {
  caller: AddExercisesCaller
  existingCatalogExerciseIds: string[]
}

export interface AddExercisesRequest extends AddExercisesRequestInput {
  requestId: string
  createdAt: number
}

export interface AddExercisesResult {
  requestId: string
  caller: AddExercisesCaller
  selections: CatalogExercise[]
  submittedAt: number
}
