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

export type ConversionJobState = 'idle' | 'processing' | 'completed' | 'error' | 'existing'
export type PresentationMode = 'fullscreen' | 'minimized' | 'hidden'

export interface ConversionState {
  jobState: ConversionJobState
  presentation: PresentationMode
  jobId: string | null
  workoutId: string | null
  sourceUrl: string
  platform: SupportedPlatform
  stage: ProcessingStage
  progress: number
  message: string
  error: string | null
}
