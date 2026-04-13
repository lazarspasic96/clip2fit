import { createMMKV } from 'react-native-mmkv'

const storage = createMMKV({ id: 'onboarding' })

const REACHED_PAYWALL_KEY = 'reached_paywall'

export const setReachedPaywall = (): void => {
  try {
    storage.set(REACHED_PAYWALL_KEY, true)
  } catch {
    // Best-effort persistence
  }
}

export const getReachedPaywall = (): boolean => {
  try {
    return storage.getBoolean(REACHED_PAYWALL_KEY) === true
  } catch {
    return false
  }
}

export const clearReachedPaywall = (): void => {
  try {
    storage.remove(REACHED_PAYWALL_KEY)
  } catch {
    // Best-effort
  }
}
