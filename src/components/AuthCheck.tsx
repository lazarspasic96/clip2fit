import { useEffect } from 'react'
import { useRouter, useSegments } from 'expo-router'
import { useUserStore } from '../store/use-user-store'
import { authService } from '../services/auth.service'

/**
 * Authentication check component that handles routing based on auth state
 * Redirects unauthenticated users to login and authenticated users away from auth screens
 */
export function AuthCheck({ children }: { children: React.ReactNode }) {
  const segments = useSegments()
  const router = useRouter()
  const { isAuthenticated } = useUserStore()

  useEffect(() => {
    // Initialize auth state when app starts
    authService.initialize().catch(err => {
      console.error('Error initializing auth:', err)
    })
  }, [])

  useEffect(() => {
    // Check if user is trying to access a protected route
    const isAuthScreen = segments[0] === 'login' || segments[0] === 'register'

    if (!isAuthenticated && !isAuthScreen) {
      // User is not authenticated and trying to access a protected route, redirect to login
      router.replace('/login')
    } else if (isAuthenticated && isAuthScreen) {
      // User is authenticated but on a login/register screen, redirect to home
      router.replace('/')
    }
  }, [isAuthenticated, segments, router])

  return <>{children}</>
}
