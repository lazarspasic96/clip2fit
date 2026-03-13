// Per-exercise ideal barbell path characteristics
export type BarbellPathConfig = {
  idealPath: 'vertical' | 's-curve'
  driftThreshold: number // normalized units
}

export const BARBELL_PATH_CONFIGS: Record<string, BarbellPathConfig> = {
  squat: { idealPath: 'vertical', driftThreshold: 0.05 },
  deadlift: { idealPath: 's-curve', driftThreshold: 0.07 },
  'bench-press': { idealPath: 'vertical', driftThreshold: 0.05 },
  'overhead-press': { idealPath: 'vertical', driftThreshold: 0.04 },
}
