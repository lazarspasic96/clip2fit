import type { ProcessingStage, ProcessingState } from '@/types/processing'
import type { WorkoutPlan } from '@/types/workout'
import type { SupportedPlatform } from '@/utils/url-validation'
import { MOCK_WORKOUT_PLAN } from '@/utils/mock-workout-session'

interface StageConfig {
  stage: ProcessingStage
  message: string
  duration: number
  progress: number
}

const STAGES: StageConfig[] = [
  { stage: 'validating', message: 'Validating URL...', duration: 800, progress: 10 },
  { stage: 'downloading', message: 'Downloading audio...', duration: 2500, progress: 35 },
  { stage: 'transcribing', message: 'Transcribing with AI...', duration: 3000, progress: 65 },
  { stage: 'extracting', message: 'Extracting workout...', duration: 2000, progress: 90 },
]

export const runMockPipeline = (
  sourceUrl: string,
  platform: SupportedPlatform,
  onUpdate: (state: ProcessingState) => void,
): (() => void) => {
  let cancelled = false
  const timeouts: ReturnType<typeof setTimeout>[] = []

  let elapsed = 0

  for (const config of STAGES) {
    const timeout = setTimeout(() => {
      if (cancelled) return
      onUpdate({
        stage: config.stage,
        progress: config.progress,
        message: config.message,
        error: null,
        result: null,
        sourceUrl,
        platform,
      })
    }, elapsed)
    timeouts.push(timeout)
    elapsed += config.duration
  }

  // Final "complete" stage with mock result
  const finalTimeout = setTimeout(() => {
    if (cancelled) return
    onUpdate({
      stage: 'complete',
      progress: 100,
      message: 'Workout extracted!',
      error: null,
      result: {
        ...MOCK_WORKOUT_PLAN,
        id: `workout-${Date.now()}`,
        sourceUrl,
        platform: (platform === 'unknown' ? 'instagram' : platform) as WorkoutPlan['platform'],
      },
      sourceUrl,
      platform,
    })
  }, elapsed)
  timeouts.push(finalTimeout)

  // Return cancel function
  return () => {
    cancelled = true
    for (const t of timeouts) {
      clearTimeout(t)
    }
  }
}
