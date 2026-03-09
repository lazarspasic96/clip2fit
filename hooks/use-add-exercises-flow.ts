import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type {
  AddExercisesRequest,
  AddExercisesRequestInput,
  AddExercisesResult,
} from '@/types/add-exercises'
import type { CatalogExercise } from '@/types/catalog'

const createRequestId = (): string => {
  const randomPart = Math.random().toString(36).slice(2, 10)
  return `addex-${Date.now()}-${randomPart}`
}

export interface AddExercisesFlowApi {
  openAddExercises: (input: AddExercisesRequestInput) => string
  getAddExercisesRequest: (requestId: string) => AddExercisesRequest | null
  submitAddExercisesResult: (requestId: string, selections: CatalogExercise[]) => AddExercisesResult | null
  consumeAddExercisesResult: (requestId: string) => AddExercisesResult | null
  cancelAddExercisesFlow: (requestId: string) => void
}

export const useAddExercisesFlow = (): AddExercisesFlowApi => {
  const queryClient = useQueryClient()

  const openAddExercises = (input: AddExercisesRequestInput): string => {
    const requestId = createRequestId()
    const request: AddExercisesRequest = {
      requestId,
      caller: input.caller,
      existingCatalogExerciseIds: [...input.existingCatalogExerciseIds],
      createdAt: Date.now(),
    }

    queryClient.setQueryData(queryKeys.ui.addExercisesRequest(requestId), request)
    queryClient.removeQueries({ queryKey: queryKeys.ui.addExercisesResult(requestId), exact: true })

    return requestId
  }

  const getAddExercisesRequest = (requestId: string): AddExercisesRequest | null => {
    const request = queryClient.getQueryData<AddExercisesRequest>(queryKeys.ui.addExercisesRequest(requestId))
    return request ?? null
  }

  const submitAddExercisesResult = (requestId: string, selections: CatalogExercise[]): AddExercisesResult | null => {
    const request = getAddExercisesRequest(requestId)
    if (request === null) return null

    const result: AddExercisesResult = {
      requestId,
      caller: request.caller,
      selections: [...selections],
      submittedAt: Date.now(),
    }

    queryClient.setQueryData(queryKeys.ui.addExercisesResult(requestId), result)
    return result
  }

  const consumeAddExercisesResult = (requestId: string): AddExercisesResult | null => {
    const result = queryClient.getQueryData<AddExercisesResult>(queryKeys.ui.addExercisesResult(requestId))
    if (result === undefined) return null

    queryClient.removeQueries({ queryKey: queryKeys.ui.addExercisesResult(requestId), exact: true })
    queryClient.removeQueries({ queryKey: queryKeys.ui.addExercisesRequest(requestId), exact: true })

    return result
  }

  const cancelAddExercisesFlow = (requestId: string) => {
    queryClient.removeQueries({ queryKey: queryKeys.ui.addExercisesResult(requestId), exact: true })
    queryClient.removeQueries({ queryKey: queryKeys.ui.addExercisesRequest(requestId), exact: true })
  }

  return {
    openAddExercises,
    getAddExercisesRequest,
    submitAddExercisesResult,
    consumeAddExercisesResult,
    cancelAddExercisesFlow,
  }
}
