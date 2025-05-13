import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mmkvStorage } from './mmkv'

interface UserState {
  // User data
  user: {
    id?: string
    username?: string
    email?: string
    name?: string
  } | null
  isAuthenticated: boolean

  // Actions
  setUser: (user: UserState['user']) => void
  login: (userData: UserState['user']) => void
  logout: () => void
  updateUserProfile: (userData: Partial<UserState['user']>) => void
}

// Create a store with persistence
export const useUserStore = create<UserState>()(
  persist(
    set => ({
      // Initial state
      user: null,
      isAuthenticated: false,

      // Actions
      setUser: user => set({ user }),
      login: userData => set({ user: userData, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      updateUserProfile: userData =>
        set(state => ({
          user: state.user ? { ...state.user, ...userData } : userData,
        })),
    }),
    {
      name: 'user-storage', // name of the item in the storage
      storage: mmkvStorage,
    }
  )
)
