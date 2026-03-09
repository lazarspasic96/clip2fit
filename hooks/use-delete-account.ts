import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiError, apiDelete } from '@/utils/api'
import { useAuth } from '@/contexts/auth-context'

export const useDeleteAccount = () => {
  const queryClient = useQueryClient()
  const { signOut } = useAuth()

  return useMutation({
    mutationFn: async () => {
      try {
        await apiDelete('/api/account', { confirm: 'DELETE' })
      } catch (error) {
        // 401 means session already invalidated server-side — treat as success
        if (error instanceof ApiError && error.status === 401) return
        throw error
      }
    },
    onSuccess: async () => {
      queryClient.clear()
      await signOut()
    },
  })
}
