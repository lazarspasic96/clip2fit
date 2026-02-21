import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type {
  CatalogExerciseDetail,
  CatalogFilters,
  CatalogListResponse,
} from '@/types/catalog'
import { ApiError, apiGet } from '@/utils/api'

const PAGE_SIZE = 30

const buildQueryString = (filters: CatalogFilters, page: number): string => {
  const params = new URLSearchParams()
  params.set('page', String(page))
  params.set('pageSize', String(PAGE_SIZE))

  if (filters.search.trim().length > 0) params.set('search', filters.search.trim())
  if (filters.muscle !== null) params.set('muscle', filters.muscle)
  if (filters.equipment !== null) params.set('equipment', filters.equipment)
  if (filters.level !== null) params.set('level', filters.level)
  if (filters.category !== null) params.set('category', filters.category)
  if (filters.force !== null) params.set('force', filters.force)
  if (filters.mechanic !== null) params.set('mechanic', filters.mechanic)

  return params.toString()
}

const filtersToHash = (filters: CatalogFilters): string =>
  JSON.stringify({
    s: filters.search.trim(),
    m: filters.muscle,
    eq: filters.equipment,
    l: filters.level,
    c: filters.category,
    f: filters.force,
    me: filters.mechanic,
  })

// --- Infinite scroll catalog list ---

export const useCatalogInfinite = (filters: CatalogFilters) => {
  const hash = filtersToHash(filters)

  const query = useInfiniteQuery({
    queryKey: queryKeys.catalog.list(hash),
    queryFn: async ({ pageParam }) => {
      const qs = buildQueryString(filters, pageParam)
      return apiGet<CatalogListResponse>(`/api/exercises/catalog?${qs}`)
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage ? lastPage.pagination.page + 1 : undefined,
  })

  const items = query.data?.pages.flatMap((page) => page.items) ?? []
  const total = query.data?.pages[0]?.pagination.total ?? 0

  return {
    items,
    total,
    isLoading: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    error: query.error instanceof ApiError
      ? query.error.message
      : query.error !== null ? 'Failed to load exercises' : null,
    refetch: query.refetch,
    isRefetching: query.isRefetching,
  }
}

// --- Single exercise detail ---

export const useCatalogDetail = (id: string | null) => {
  const query = useQuery({
    queryKey: queryKeys.catalog.detail(id ?? ''),
    queryFn: () => apiGet<CatalogExerciseDetail>(`/api/exercises/catalog/${id}`),
    enabled: id !== null && id.length > 0,
  })

  return {
    exercise: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error instanceof ApiError
      ? query.error.message
      : query.error !== null ? 'Failed to load exercise' : null,
  }
}

// --- Related exercises (same primary muscle) ---

export const useCatalogRelated = (excludeId: string, muscle: string | null) => {
  const query = useQuery({
    queryKey: queryKeys.catalog.related(excludeId, muscle ?? ''),
    queryFn: () => {
      const params = new URLSearchParams()
      params.set('pageSize', '7')
      if (muscle !== null) params.set('muscle', muscle)
      return apiGet<CatalogListResponse>(`/api/exercises/catalog?${params.toString()}`)
    },
    enabled: muscle !== null && muscle.length > 0,
  })

  const items = (query.data?.items ?? []).filter((e) => e.id !== excludeId).slice(0, 6)

  return {
    items,
    isLoading: query.isLoading,
  }
}
