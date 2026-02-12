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
} as const
