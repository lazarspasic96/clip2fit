import type { Session, User } from '@supabase/supabase-js'
import type { UserProfile } from './profile'

export type AuthSession = Session
export type AuthUser = User

export interface AuthContextType {
  session: AuthSession | null
  user: AuthUser | null
  loading: boolean
  initialized: boolean
  signIn: (credentials: LoginCredentials) => Promise<AuthResult>
  signUp: (credentials: SignupCredentials) => Promise<AuthResult>
  signInWithGoogle: () => Promise<AuthResult>
  signOut: () => Promise<void>
  resendSignUpEmail: (email: string) => Promise<AuthResult>
  saveProfile: (profile: Partial<UserProfile>) => Promise<AuthResult>
  completeOnboarding: () => Promise<AuthResult>
  onboardingComplete: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  email: string
  password: string
}

export interface AuthResult {
  success: boolean
  error?: string
}
