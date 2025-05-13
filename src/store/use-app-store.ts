import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { mmkvStorage } from './mmkv'

interface AppState {
  // App settings
  isLoading: boolean
  isDarkMode: boolean
  showDrawer: boolean

  // Actions
  setLoading: (isLoading: boolean) => void
  setDarkMode: (isDarkMode: boolean) => void
  toggleDarkMode: () => void
  setShowDrawer: (showDrawer: boolean) => void
  toggleDrawer: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      // Initial state
      isLoading: false,
      isDarkMode: false,
      showDrawer: false,

      // Actions
      setLoading: isLoading => set({ isLoading }),
      setDarkMode: isDarkMode => set({ isDarkMode }),
      toggleDarkMode: () => set(state => ({ isDarkMode: !state.isDarkMode })),
      setShowDrawer: showDrawer => set({ showDrawer }),
      toggleDrawer: () => set(state => ({ showDrawer: !state.showDrawer })),
    }),
    {
      name: 'app-settings', // name of the item in the storage
      storage: mmkvStorage,
    }
  )
)
