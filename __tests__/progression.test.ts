import { describe, it, expect } from 'vitest'
import {
  parseTargetReps,
  getProgressionTarget,
  muscleGroupCategory,
  getIncrement,
  isEligible,
  computeTarget,
} from '@/utils/progression'

// --- parseTargetReps ---

describe('parseTargetReps', () => {
  it('parses exact reps "8"', () => {
    expect(parseTargetReps('8')).toEqual({ type: 'exact', value: 8 })
  })

  it('parses exact reps "12"', () => {
    expect(parseTargetReps('12')).toEqual({ type: 'exact', value: 12 })
  })

  it('parses range "8-12"', () => {
    expect(parseTargetReps('8-12')).toEqual({ type: 'range', low: 8, high: 12 })
  })

  it('parses range with spaces "8 - 12"', () => {
    expect(parseTargetReps('8 - 12')).toEqual({ type: 'range', low: 8, high: 12 })
  })

  it('returns null for "AMRAP"', () => {
    expect(parseTargetReps('AMRAP')).toBeNull()
  })

  it('returns null for "to failure"', () => {
    expect(parseTargetReps('to failure')).toBeNull()
  })

  it('returns null for "30 sec"', () => {
    expect(parseTargetReps('30 sec')).toBeNull()
  })

  it('returns null for "8/side"', () => {
    expect(parseTargetReps('8/side')).toBeNull()
  })

  it('returns null for "10 per side"', () => {
    expect(parseTargetReps('10 per side')).toBeNull()
  })

  it('returns null for null', () => {
    expect(parseTargetReps(null)).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseTargetReps('')).toBeNull()
  })

  it('returns null for whitespace', () => {
    expect(parseTargetReps('  ')).toBeNull()
  })

  it('returns null for text like "max"', () => {
    expect(parseTargetReps('max')).toBeNull()
  })
})

// --- getProgressionTarget ---

describe('getProgressionTarget', () => {
  it('returns value for exact reps', () => {
    expect(getProgressionTarget({ type: 'exact', value: 8 })).toBe(8)
  })

  it('returns upper bound for range reps', () => {
    expect(getProgressionTarget({ type: 'range', low: 8, high: 12 })).toBe(12)
  })
})

// --- muscleGroupCategory ---

describe('muscleGroupCategory', () => {
  it('maps chest to upper_compound', () => {
    expect(muscleGroupCategory(['chest'])).toBe('upper_compound')
  })

  it('maps shoulders to upper_compound', () => {
    expect(muscleGroupCategory(['shoulders'])).toBe('upper_compound')
  })

  it('maps lats to upper_compound', () => {
    expect(muscleGroupCategory(['lats'])).toBe('upper_compound')
  })

  it('maps quadriceps to lower_compound', () => {
    expect(muscleGroupCategory(['quadriceps'])).toBe('lower_compound')
  })

  it('maps hamstrings to lower_compound', () => {
    expect(muscleGroupCategory(['hamstrings'])).toBe('lower_compound')
  })

  it('maps glutes to lower_compound', () => {
    expect(muscleGroupCategory(['glutes'])).toBe('lower_compound')
  })

  it('maps biceps to isolation', () => {
    expect(muscleGroupCategory(['biceps'])).toBe('isolation')
  })

  it('maps triceps to isolation', () => {
    expect(muscleGroupCategory(['triceps'])).toBe('isolation')
  })

  it('maps calves to isolation', () => {
    expect(muscleGroupCategory(['calves'])).toBe('isolation')
  })

  it('uses first group when multiple provided', () => {
    expect(muscleGroupCategory(['chest', 'triceps'])).toBe('upper_compound')
  })

  it('defaults to upper_compound for empty array', () => {
    expect(muscleGroupCategory([])).toBe('upper_compound')
  })

  it('defaults to upper_compound for unknown group', () => {
    expect(muscleGroupCategory(['unknown_muscle'])).toBe('upper_compound')
  })

  it('normalizes alias "pectorals" to chest → upper_compound', () => {
    expect(muscleGroupCategory(['pectorals'])).toBe('upper_compound')
  })

  it('normalizes alias "quads" to quadriceps → lower_compound', () => {
    expect(muscleGroupCategory(['quads'])).toBe('lower_compound')
  })
})

// --- getIncrement ---

describe('getIncrement', () => {
  it('returns 2.5 for upper_compound', () => {
    expect(getIncrement('upper_compound')).toBe(2.5)
  })

  it('returns 5 for lower_compound', () => {
    expect(getIncrement('lower_compound')).toBe(5)
  })

  it('returns 1.25 for isolation', () => {
    expect(getIncrement('isolation')).toBe(1.25)
  })
})

// --- isEligible ---

describe('isEligible', () => {
  const base = {
    catalogExerciseId: 'abc-123',
    isBodyweight: false,
    targetReps: '8',
  }

  it('returns true when all conditions met', () => {
    expect(isEligible(base, 2)).toBe(true)
  })

  it('returns true with range reps', () => {
    expect(isEligible({ ...base, targetReps: '8-12' }, 3)).toBe(true)
  })

  it('returns false without catalogExerciseId', () => {
    expect(isEligible({ ...base, catalogExerciseId: null }, 2)).toBe(false)
  })

  it('returns false with undefined catalogExerciseId', () => {
    expect(isEligible({ ...base, catalogExerciseId: undefined }, 2)).toBe(false)
  })

  it('returns false with empty catalogExerciseId', () => {
    expect(isEligible({ ...base, catalogExerciseId: '' }, 2)).toBe(false)
  })

  it('returns false for bodyweight exercise', () => {
    expect(isEligible({ ...base, isBodyweight: true }, 2)).toBe(false)
  })

  it('returns false for AMRAP reps', () => {
    expect(isEligible({ ...base, targetReps: 'AMRAP' }, 2)).toBe(false)
  })

  it('returns false for "to failure"', () => {
    expect(isEligible({ ...base, targetReps: 'to failure' }, 2)).toBe(false)
  })

  it('returns false for null targetReps', () => {
    expect(isEligible({ ...base, targetReps: null }, 2)).toBe(false)
  })

  it('returns false with only 1 session', () => {
    expect(isEligible(base, 1)).toBe(false)
  })

  it('returns false with 0 sessions', () => {
    expect(isEligible(base, 0)).toBe(false)
  })
})

// --- computeTarget ---

describe('computeTarget', () => {
  it('progresses when all reps hit exact target', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 8 },
        { actualWeight: 70, actualReps: 8 },
        { actualWeight: 70, actualReps: 8 },
      ],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 72.5, delta: 2.5, isProgress: true })
  })

  it('progresses when all reps hit upper bound of range', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 12 },
        { actualWeight: 70, actualReps: 12 },
        { actualWeight: 70, actualReps: 13 },
      ],
      targetReps: '8-12',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 72.5, delta: 2.5, isProgress: true })
  })

  it('retries when some reps missed on range', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 12 },
        { actualWeight: 70, actualReps: 10 },
        { actualWeight: 70, actualReps: 9 },
      ],
      targetReps: '8-12',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 70, delta: 0, isProgress: false })
  })

  it('retries when reps missed on exact target', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 8 },
        { actualWeight: 70, actualReps: 7 },
        { actualWeight: 70, actualReps: 6 },
      ],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 70, delta: 0, isProgress: false })
  })

  it('retries when all reps missed', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 5 },
        { actualWeight: 70, actualReps: 4 },
      ],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 70, delta: 0, isProgress: false })
  })

  it('returns null for empty previous sets', () => {
    const result = computeTarget({
      previousSets: [],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toBeNull()
  })

  it('returns null when all set data is null', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: null, actualReps: null },
        { actualWeight: null, actualReps: null },
      ],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toBeNull()
  })

  it('returns null for unparseable reps', () => {
    const result = computeTarget({
      previousSets: [{ actualWeight: 70, actualReps: 8 }],
      targetReps: 'AMRAP',
      muscleGroups: ['chest'],
    })
    expect(result).toBeNull()
  })

  it('uses lower_compound increment for quadriceps', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 100, actualReps: 10 },
        { actualWeight: 100, actualReps: 10 },
      ],
      targetReps: '10',
      muscleGroups: ['quadriceps'],
    })
    expect(result).toEqual({ weight: 105, delta: 5, isProgress: true })
  })

  it('uses isolation increment for biceps', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 15, actualReps: 12 },
        { actualWeight: 15, actualReps: 12 },
      ],
      targetReps: '10-12',
      muscleGroups: ['biceps'],
    })
    expect(result).toEqual({ weight: 16.25, delta: 1.25, isProgress: true })
  })

  it('uses primary muscle group for multi-group exercises', () => {
    const result = computeTarget({
      previousSets: [{ actualWeight: 60, actualReps: 10 }],
      targetReps: '10',
      muscleGroups: ['chest', 'triceps'],
    })
    expect(result).toEqual({ weight: 62.5, delta: 2.5, isProgress: true })
  })

  it('handles mixed null/valid set data (filters to valid only)', () => {
    const result = computeTarget({
      previousSets: [
        { actualWeight: 70, actualReps: 8 },
        { actualWeight: null, actualReps: null },
        { actualWeight: 70, actualReps: 8 },
      ],
      targetReps: '8',
      muscleGroups: ['chest'],
    })
    expect(result).toEqual({ weight: 72.5, delta: 2.5, isProgress: true })
  })

  it('defaults to upper_compound increment for empty muscle groups', () => {
    const result = computeTarget({
      previousSets: [{ actualWeight: 50, actualReps: 10 }],
      targetReps: '10',
      muscleGroups: [],
    })
    expect(result).toEqual({ weight: 52.5, delta: 2.5, isProgress: true })
  })
})
