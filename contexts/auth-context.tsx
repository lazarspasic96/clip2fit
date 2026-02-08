import type {
  AuthContextType,
  AuthResult,
  AuthSession,
  AuthUser,
  LoginCredentials,
  SignupCredentials,
} from '@/types/auth'
import type { UserProfile } from '@/types/profile'
import { supabase } from '@/utils/supabase'
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

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
    console.log('[Profile] Data to save when backend is ready:', profile)
    return { success: true }
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
