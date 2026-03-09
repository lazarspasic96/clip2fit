import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'

import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useCatalogInfinite } from '@/hooks/use-catalog'
import { pickerFilterStore } from '@/stores/picker-filter-store'
import type { AddExercisesRequest } from '@/types/add-exercises'
import type { CatalogExercise, CatalogFilters } from '@/types/catalog'

export interface AddExercisesController {
  request: AddExercisesRequest | null
  filters: CatalogFilters
  setFilters: (next: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => void
  items: CatalogExercise[]
  total: number
  isLoading: boolean
  isFetchingNextPage: boolean
  hasNextPage: boolean
  fetchNextPage: () => void
  error: string | null
  refetch: () => void
  isRefetching: boolean
  selectedCount: number
  selectionVersion: number
  isSelected: (id: string) => boolean
  isDisabled: (id: string) => boolean
  toggleExercise: (exercise: CatalogExercise) => void
  getSelected: () => CatalogExercise[]
  hasSelection: boolean
  clearSelection: () => void
}

export const useAddExercisesController = (request: AddExercisesRequest | null): AddExercisesController => {
  const filters = useSyncExternalStore(pickerFilterStore.subscribe, pickerFilterStore.getFilters)
  const debouncedSearch = useDebouncedValue(filters.search, 300)

  useEffect(() => {
    pickerFilterStore.resetFilters()
  }, [])

  const activeFilters: CatalogFilters = { ...filters, search: debouncedSearch }
  const catalog = useCatalogInfinite(activeFilters)

  const existingIdSet = useMemo(
    () => new Set(request?.existingCatalogExerciseIds ?? []),
    [request?.existingCatalogExerciseIds],
  )

  const [selectedMap, setSelectedMap] = useState<Map<string, CatalogExercise>>(new Map())
  const [selectionVersion, setSelectionVersion] = useState(0)

  const setFilters = (next: CatalogFilters | ((prev: CatalogFilters) => CatalogFilters)) => {
    if (typeof next === 'function') {
      pickerFilterStore.setFilters(next(pickerFilterStore.getFilters()))
      return
    }
    pickerFilterStore.setFilters(next)
  }

  const isSelected = (id: string): boolean => selectedMap.has(id)

  const isDisabled = (id: string): boolean => existingIdSet.has(id)

  const toggleExercise = (exercise: CatalogExercise) => {
    if (existingIdSet.has(exercise.id)) return

    setSelectedMap((prev) => {
      const next = new Map(prev)
      if (next.has(exercise.id)) {
        next.delete(exercise.id)
      } else {
        next.set(exercise.id, exercise)
      }
      return next
    })
    setSelectionVersion((prev) => prev + 1)
  }

  const getSelected = (): CatalogExercise[] => Array.from(selectedMap.values())

  const clearSelection = () => {
    setSelectedMap(new Map())
    setSelectionVersion((prev) => prev + 1)
  }

  return {
    request,
    filters,
    setFilters,
    items: catalog.items,
    total: catalog.total,
    isLoading: catalog.isLoading,
    isFetchingNextPage: catalog.isFetchingNextPage,
    hasNextPage: catalog.hasNextPage,
    fetchNextPage: () => { void catalog.fetchNextPage() },
    error: catalog.error,
    refetch: () => { void catalog.refetch() },
    isRefetching: catalog.isRefetching,
    selectedCount: selectedMap.size,
    selectionVersion,
    isSelected,
    isDisabled,
    toggleExercise,
    getSelected,
    hasSelection: selectedMap.size > 0,
    clearSelection,
  }
}
