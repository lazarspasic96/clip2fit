import { useQuery } from '@tanstack/react-query'

import { queryKeys } from '@/constants/query-keys'
import type { HeatmapData } from '@/types/heatmap'
import { mapHeatmapResponse } from '@/types/heatmap'
import { apiGet, ApiError } from '@/utils/api'

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

  if (query.data !== undefined) {
    console.log('[use-heatmap] raw API response:', JSON.stringify(query.data, null, 2))
  }
  if (query.error !== undefined && query.error !== null) {
    console.log('[use-heatmap] query error:', query.error)
  }

  const mapped = query.data !== undefined ? mapHeatmapResponse(query.data) : null

  if (mapped !== null) {
    console.log('[use-heatmap] mapped result:', JSON.stringify({
      totalSessions: mapped.totalSessions,
      activeDays: mapped.activeDays,
      daysCount: mapped.days.length,
      days: mapped.days,
    }, null, 2))
  }

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
