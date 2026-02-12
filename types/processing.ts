import type { SupportedPlatform } from '@/utils/url-validation'
import type { WorkoutPlan } from '@/types/workout'

export type ProcessingStage = 'validating' | 'downloading' | 'transcribing' | 'extracting' | 'complete' | 'error'

export interface ProcessingState {
  stage: ProcessingStage
  progress: number
  message: string
  error: string | null
  result: WorkoutPlan | null
  sourceUrl: string
  platform: SupportedPlatform
}
