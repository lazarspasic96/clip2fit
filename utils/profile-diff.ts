import type { UserProfile } from '@/types/profile'

export const computeProfileDiff = (
  current: Partial<UserProfile>,
  updated: Partial<UserProfile>,
): Partial<UserProfile> => {
  const diff: Partial<UserProfile> = {}

  for (const key of Object.keys(updated) as (keyof UserProfile)[]) {
    if (updated[key] !== current[key]) {
      ;(diff as Record<string, unknown>)[key] = updated[key]
    }
  }

  return diff
}
