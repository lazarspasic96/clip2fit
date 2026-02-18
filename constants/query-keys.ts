export const queryKeys = {
  workouts: {
    all: ['workouts'] as const,
    detail: (id: string) => ['workouts', id] as const,
  },
  profile: {
    current: ['profile'] as const,
  },
  schedule: {
    current: ['schedule'] as const,
  },
  sessions: {
    last: ['sessions', 'last'] as const,
  },
  stats: {
    summary: (period: string) => ['stats', 'summary', period] as const,
    prs: (catalogExerciseId: string | null) => ['stats', 'prs', catalogExerciseId ?? 'all'] as const,
    exerciseHistory: (catalogExerciseId: string | null, exerciseName: string | null, period: string) =>
      ['stats', 'exercise-history', catalogExerciseId ?? 'none', exerciseName ?? '', period] as const,
  },
} as const
