import { supabase } from '../library/utils/supabase'
import { useUserStore } from '../store/use-user-store'
import { Session, User } from '@supabase/supabase-js'

/**
 * Handles user authentication operations and syncs with the local store
 */
export const authService = {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    if (data?.user) {
      await this.syncUserProfile(data.user, data.session)
    }

    return data
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error
    return data
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut()
    useUserStore.getState().logout()
    if (error) throw error
  },

  /**
   * Get the current session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    if (data?.session) {
      await this.syncUserProfile(data.session.user, data.session)
    }

    return data
  },

  /**
   * Sync user profile from Supabase to local store
   */

  async syncUserProfile(user: User, _session: Session | null) {
    // Fetch the user profile from the profiles table
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
    }

    // Combine auth data with profile data
    const userData = {
      id: user.id,
      email: user.email,
      ...(profile || {}),
    }

    // Update the store
    useUserStore.getState().login(userData)

    return userData
  },

  /**
   * Initialize the auth state by checking the current session
   */
  async initialize() {
    try {
      await this.getSession()
    } catch (error) {
      console.error('Auth initialization error:', error)
      useUserStore.getState().logout()
    }
  },
}
