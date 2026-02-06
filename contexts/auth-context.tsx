import type {
  AuthContextType,
  AuthResult,
  AuthSession,
  AuthUser,
  LoginCredentials,
  SignupCredentials,
} from '@/types/auth'
import { supabase } from '@/utils/supabase'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user, loading, initialized, signIn, signUp, signOut }}>
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
