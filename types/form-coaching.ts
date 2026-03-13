export type FormCoachingRequest = {
  exerciseName: string
  summary: FormDataSummary
}

export type FormCoachingResponse = {
  message: string
}

export type FormDataSummary = {
  exerciseName: string
  repCount: number
  setCount: number
  activeIssues: string[]
  skippedChecks: string[]
  cameraAngle: string
  avgAngles: Record<string, number>
}
