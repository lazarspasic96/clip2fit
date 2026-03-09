import type { UserProfile } from '@/types/profile'

const isEqual = (a: unknown, b: unknown): boolean => {
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b)
  }
  if (Array.isArray(a) && b === undefined) return a.length === 0
  if (a === undefined && Array.isArray(b)) return b.length === 0
  return a === b
}

export const computeProfileDiff = (
  current: Partial<UserProfile>,
  updated: Partial<UserProfile>,
): Partial<UserProfile> => {
  const diff: Partial<UserProfile> = {}

  for (const key of Object.keys(updated) as (keyof UserProfile)[]) {
    if (!isEqual(updated[key], current[key])) {
      ;(diff as Record<string, unknown>)[key] = updated[key]
    }
  }

  return diff
}
