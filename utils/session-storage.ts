import { createMMKV } from 'react-native-mmkv'
import type { WorkoutSession } from '@/types/workout'

const storage = createMMKV({ id: 'active-workout' })

const SESSION_KEY = 'session'

export const saveSession = (session: WorkoutSession): void => {
  try {
    storage.set(SESSION_KEY, JSON.stringify(session))
  } catch {
    // Silently fail — persistence is best-effort
  }
}

const isToday = (timestamp: number): boolean => {
  const d = new Date(timestamp)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

export const loadSession = (): WorkoutSession | null => {
  try {
    const raw = storage.getString(SESSION_KEY)
    if (raw === undefined) return null
    const session = JSON.parse(raw) as WorkoutSession

    // Clear stale completed sessions from previous days
    if (
      session.status === 'completed' &&
      session.completedAt !== undefined &&
      !isToday(session.completedAt)
    ) {
      storage.remove(SESSION_KEY)
      return null
    }

    return session
  } catch {
    storage.remove(SESSION_KEY)
    return null
  }
}

export const clearPersistedSession = (): void => {
  try {
    storage.remove(SESSION_KEY)
  } catch {
    // Silently fail
  }
}
