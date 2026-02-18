import type {
  AuthContextType,
  AuthResult,
  AuthSession,
  AuthUser,
  LoginCredentials,
  SignupCredentials,
} from '@/types/auth'
import type { UserProfile } from '@/types/profile'
import type { ApiProfileResponse } from '@/types/api'
import { mapProfileToApi } from '@/types/api'
import { queryKeys } from '@/constants/query-keys'
import { apiGet, apiPatch, ApiError } from '@/utils/api'
import { emitTimezoneTelemetryEvent } from '@/utils/timezone-observability'
import {
  getTimezoneSyncSnapshot,
  markTimezoneSyncFailure,
  markTimezoneSyncSuccess,
} from '@/utils/timezone-sync-storage'
import { supabase } from '@/utils/supabase'
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import { useQueryClient } from '@tanstack/react-query'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AppState, type AppStateStatus } from 'react-native'

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const TZ_SYNC_TAG = '[timezone-sync]'
const TZ_RESUME_SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000
const TZ_SYNC_RETRY_DELAYS_MS = [1000, 3000, 10000] as const

type TimezoneSyncTrigger = 'auth_session_ready' | 'app_resume'

const getDeviceTimeZone = (): string | null => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (typeof timezone === 'string' && timezone.trim().length > 0) return timezone.trim()
  } catch {
    // Fall through to null.
  }
  return null
}

const wait = async (ms: number) => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const shouldRetryTimezoneSync = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.status >= 500
  }
  return true
}

const formatSyncError = (error: unknown) => {
  if (error instanceof ApiError) return `${error.status} ${error.message}`
  if (error instanceof Error) return error.message
  return String(error)
}

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const timezoneSyncInFlightRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    // Restore session from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setInitialized(true)
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const onboardingComplete = useMemo(() => {
    return !!user?.user_metadata?.onboardingComplete
  }, [user?.user_metadata?.onboardingComplete])

  const getProfileTimezone = useCallback(async (userId: string): Promise<string | null> => {
    const cachedProfile = queryClient.getQueryData<ApiProfileResponse>(queryKeys.profile.current)
    if (cachedProfile?.id === userId) return cachedProfile.timezone

    try {
      const profile = await queryClient.fetchQuery({
        queryKey: queryKeys.profile.current,
        queryFn: () => apiGet<ApiProfileResponse>('/api/profiles'),
        retry: false,
        staleTime: 0,
      })
      return profile.id === userId ? profile.timezone : null
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null
      }
      throw error
    }
  }, [queryClient])

  const syncTimezone = useCallback(async (userId: string, trigger: TimezoneSyncTrigger): Promise<void> => {
    if (timezoneSyncInFlightRef.current !== null) {
      return timezoneSyncInFlightRef.current
    }

    const task = (async () => {
      const snapshot = getTimezoneSyncSnapshot()
      const now = Date.now()

      if (
        trigger === 'app_resume'
        && snapshot.lastSyncedAt !== null
        && (now - snapshot.lastSyncedAt) < TZ_RESUME_SYNC_INTERVAL_MS
      ) {
        return
      }

      const deviceTimezone = getDeviceTimeZone()
      if (deviceTimezone === null) {
        markTimezoneSyncFailure(now)
        emitTimezoneTelemetryEvent('timezone_sync_failed', {
          trigger,
          error: 'missing_device_timezone',
          lastTimezoneSyncErrorAt: now,
        })
        console.warn(TZ_SYNC_TAG, 'timezone sync failed: missing device timezone')
        return
      }

      const profileTimezone = await getProfileTimezone(userId)
      const cacheMatches = snapshot.lastSyncedTimezone === deviceTimezone
      const profileMatches = profileTimezone === deviceTimezone

      if (cacheMatches && profileMatches) {
        markTimezoneSyncSuccess(deviceTimezone, now)
        if (__DEV__) {
          console.log(TZ_SYNC_TAG, 'profile already synced:', deviceTimezone)
        }
        return
      }

      let attempt = 1
      while (true) {
        emitTimezoneTelemetryEvent('timezone_sync_attempt', {
          trigger,
          attempt,
          device_timezone: deviceTimezone,
          profile_timezone: profileTimezone,
          cached_timezone: snapshot.lastSyncedTimezone,
        })

        try {
          const updatedProfile = await apiPatch<ApiProfileResponse>('/api/profiles', { timezone: deviceTimezone })
          queryClient.setQueryData(queryKeys.profile.current, updatedProfile)
          queryClient.invalidateQueries({ queryKey: ['stats'] })
          queryClient.invalidateQueries({ queryKey: queryKeys.sessions.last })
          markTimezoneSyncSuccess(deviceTimezone)

          if (__DEV__) {
            console.log(TZ_SYNC_TAG, 'profile timezone updated:', JSON.stringify({
              from: profileTimezone,
              to: deviceTimezone,
              attempt,
              trigger,
            }))
          }
          return
        } catch (error) {
          const retryDelay = TZ_SYNC_RETRY_DELAYS_MS[attempt - 1]
          const retryable = shouldRetryTimezoneSync(error)

          if (!retryable || retryDelay === undefined) {
            const message = formatSyncError(error)
            const failedAt = Date.now()
            markTimezoneSyncFailure(failedAt)
            emitTimezoneTelemetryEvent('timezone_sync_failed', {
              trigger,
              attempt,
              error: message,
              retryable,
              lastTimezoneSyncErrorAt: failedAt,
            })
            console.warn(TZ_SYNC_TAG, 'timezone sync failed:', message)
            return
          }

          await wait(retryDelay)
          attempt += 1
        }
      }
    })()

    timezoneSyncInFlightRef.current = task
    try {
      await task
    } finally {
      timezoneSyncInFlightRef.current = null
    }
  }, [getProfileTimezone, queryClient])

  useEffect(() => {
    const userId = session?.user?.id
    if (typeof userId !== 'string' || userId.length === 0) return

    void syncTimezone(userId, 'auth_session_ready')
  }, [session?.user?.id, syncTimezone])

  useEffect(() => {
    const userId = session?.user?.id
    if (typeof userId !== 'string' || userId.length === 0) return

    let previousAppState: AppStateStatus = AppState.currentState
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      const wasInBackground = previousAppState !== 'active'
      previousAppState = nextAppState

      if (wasInBackground && nextAppState === 'active') {
        void syncTimezone(userId, 'app_resume')
      }
    })

    return () => {
      subscription.remove()
    }
  }, [session?.user?.id, syncTimezone])

  const signIn = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const signUp = useCallback(async (credentials: SignupCredentials): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const signInWithGoogle = useCallback(async (): Promise<AuthResult> => {
    setLoading(true)
    try {
      await GoogleSignin.hasPlayServices()
      const response = await GoogleSignin.signIn()

      if (!response.data?.idToken) {
        return { success: false, error: 'No ID token returned from Google' }
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: response.data.idToken,
      })

      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: unknown) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          return { success: false, error: 'Sign in cancelled' }
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          return { success: false, error: 'Sign in already in progress' }
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          return { success: false, error: 'Google Play Services not available' }
        }
      }
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const resendSignUpEmail = useCallback(async (email: string): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email })
      if (error) {
        return { success: false, error: error.message }
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const saveProfile = useCallback(async (profile: Partial<UserProfile>): Promise<AuthResult> => {
    try {
      await apiPatch('/api/profiles', mapProfileToApi(profile))
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof ApiError ? error.message : 'Failed to save profile'
      return { success: false, error: message }
    }
  }, [])

  const completeOnboarding = useCallback(async (): Promise<AuthResult> => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { onboardingComplete: true },
      })
      if (error) {
        return { success: false, error: error.message }
      }
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'An unexpected error occurred'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        initialized,
        onboardingComplete,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resendSignUpEmail,
        saveProfile,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
