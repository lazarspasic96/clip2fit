import { useMutation } from '@tanstack/react-query'
import { authService } from 'services/auth.service'

export function useSignInMutation() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => {
      // Now accepts a single object parameter
      return authService.signIn(credentials.email, credentials.password)
    },
  })
}

export function useSignUpMutation() {
  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) => {
      // Now accepts a single object parameter
      return authService.signUp(credentials.email, credentials.password)
    },
  })
}

export function useSignOutMutation() {
  return useMutation({
    mutationFn: () => authService.signOut(),
  })
}
