import type { CameraAngle, FormIssue } from '@/types/form-rules'
import type { FormDataSummary } from '@/types/form-coaching'

const RING_BUFFER_SIZE = 60

type FrameData = {
  issues: string[]
  angles: Record<string, number>
}

export const createFormDataAggregator = () => {
  const buffer: FrameData[] = []
  let exerciseName = ''
  let repCount = 0
  let setCount = 0
  let cameraAngle: CameraAngle = 'side'
  let skippedChecks: string[] = []

  const addFrame = (data: {
    issues: FormIssue[]
    angles: Record<string, number>
    cameraAngle: CameraAngle
    repCount: number
    setCount: number
    exerciseName: string
    skippedChecks: string[]
  }) => {
    buffer.push({
      issues: data.issues.map((i) => i.message),
      angles: { ...data.angles },
    })
    if (buffer.length > RING_BUFFER_SIZE) {
      buffer.shift()
    }
    exerciseName = data.exerciseName
    repCount = data.repCount
    setCount = data.setCount
    cameraAngle = data.cameraAngle
    skippedChecks = data.skippedChecks
  }

  const getSummary = (): FormDataSummary => {
    // Count issue frequency
    const issueCounts = new Map<string, number>()
    for (const frame of buffer) {
      for (const issue of frame.issues) {
        issueCounts.set(issue, (issueCounts.get(issue) ?? 0) + 1)
      }
    }
    const activeIssues = [...issueCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name)

    // Average angles across buffer
    const angleSums: Record<string, { total: number; count: number }> = {}
    for (const frame of buffer) {
      for (const [name, value] of Object.entries(frame.angles)) {
        if (angleSums[name] === undefined) {
          angleSums[name] = { total: 0, count: 0 }
        }
        angleSums[name].total += value
        angleSums[name].count += 1
      }
    }
    const avgAngles: Record<string, number> = {}
    for (const [name, { total, count }] of Object.entries(angleSums)) {
      avgAngles[name] = Math.round(total / count)
    }

    return { exerciseName, repCount, setCount, activeIssues, skippedChecks, cameraAngle, avgAngles }
  }

  const reset = () => {
    buffer.length = 0
  }

  return { addFrame, getSummary, reset }
}
