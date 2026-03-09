import { getMuscleCategory } from '@/utils/muscle-color'
import type { MuscleCategory } from '@/constants/muscle-colors'

const TITLE_PATTERNS: [RegExp, string][] = [
  [/\bpush\b/i, 'P'],
  [/\bpull\b/i, 'PL'],
  [/\blegs?\b/i, 'L'],
  [/\bupper\b/i, 'U'],
  [/\blower\b/i, 'LO'],
  [/\bfull\s*body\b/i, 'FB'],
  [/\bchest\b/i, 'C'],
  [/\bback\b/i, 'B'],
  [/\bshoulder\b/i, 'S'],
  [/\barms?\b/i, 'A'],
  [/\bcore\b/i, 'Co'],
  [/\babs\b/i, 'Co'],
]

const CATEGORY_ABBREV: Record<MuscleCategory, string> = {
  chest: 'C',
  back: 'B',
  shoulders: 'S',
  arms: 'A',
  legs: 'L',
  core: 'Co',
  full_body: 'FB',
}

export const getWorkoutAbbrev = (
  title?: string,
  primaryMuscle?: string,
): string | undefined => {
  if (title !== undefined) {
    for (const [pattern, abbrev] of TITLE_PATTERNS) {
      if (pattern.test(title)) return abbrev
    }
  }

  if (primaryMuscle !== undefined) {
    const category = getMuscleCategory(primaryMuscle)
    if (category !== null) return CATEGORY_ABBREV[category]
  }

  return undefined
}
