import 'react-native-url-polyfill/auto'
import { MMKV } from 'react-native-mmkv'
import { createClient } from '@supabase/supabase-js'
import { AppState } from 'react-native'

// Initialize MMKV instance or use your existing one from mmkv.ts
const mmkvAuth = new MMKV({
  id: 'supabase-auth',
})

// Create a storage adapter for Supabase that uses MMKV
const mmkvStorageAdapter = {
  getItem: async (key: string): Promise<string | null> => {
    const value = mmkvAuth.getString(key)
    return value || null
  },
  setItem: async (key: string, value: string): Promise<void> => {
    mmkvAuth.set(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    mmkvAuth.delete(key)
  },
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  {
    auth: {
      storage: mmkvStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)

AppState.addEventListener('change', nextAppState => {
  if (nextAppState === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})
