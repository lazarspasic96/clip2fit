import { useQuery } from '@tanstack/react-query'

import type { ApiProfileResponse } from '@/types/api'
import { mapApiProfileToMobile } from '@/types/api'
import type { UserProfile } from '@/types/profile'
import { apiGet, ApiError } from '@/utils/api'
import { queryKeys } from '@/constants/query-keys'

interface ProfileQueryResult {
  profile: UserProfile | null
  isLoading: boolean
  error: string | null
}

export const useProfileQuery = (): ProfileQueryResult => {
  const query = useQuery({
    queryKey: queryKeys.profile.current,
    queryFn: () => apiGet<ApiProfileResponse>('/api/profiles'),
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false
      return failureCount < 2
    },
  })

  const is404 = query.error instanceof ApiError && query.error.status === 404

  return {
    profile: query.data !== undefined ? mapApiProfileToMobile(query.data) : null,
    isLoading: query.isLoading,
    error: is404
      ? null
      : query.error instanceof ApiError
        ? query.error.message
        : query.error !== null
          ? 'Failed to load profile'
          : null,
  }
}
