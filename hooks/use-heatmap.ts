import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type { HeatmapData } from '@/types/heatmap'
import { mapHeatmapResponse } from '@/types/heatmap'
import { ApiError, apiGet } from '@/utils/api'

interface HeatmapQueryResult {
  days: HeatmapData['days']
  totalSessions: number
  activeDays: number
  isLoading: boolean
  error: string | null
}

export const useHeatmap = (period = '1y'): HeatmapQueryResult => {
  const query = useQuery({
    queryKey: queryKeys.heatmap.data(period),
    queryFn: () => apiGet<unknown>(`/api/stats/heatmap?period=${period}`),
    staleTime: 5 * 60 * 1000,
  })

  const mapped = query.data !== undefined ? mapHeatmapResponse(query.data) : null

  return {
    days: mapped?.days ?? [],
    totalSessions: mapped?.totalSessions ?? 0,
    activeDays: mapped?.activeDays ?? 0,
    isLoading: query.isLoading,
    error:
      query.error instanceof ApiError
        ? query.error.message
        : query.error !== null
          ? 'Failed to load activity data'
          : null,
  }
}
