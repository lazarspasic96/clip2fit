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
} as const
