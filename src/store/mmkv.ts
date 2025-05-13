import { MMKV } from 'react-native-mmkv'
import { createJSONStorage } from 'zustand/middleware'

// Initialize MMKV instance
const storage = new MMKV({
  id: 'mmkv-store',
})

// Create a storage adapter for Zustand that uses MMKV
export const mmkvStorage = createJSONStorage(() => ({
  setItem: (name, value) => {
    storage.set(name, value)
  },
  getItem: name => {
    const value = storage.getString(name)
    return value ?? null
  },
  removeItem: name => {
    storage.delete(name)
  },
}))
