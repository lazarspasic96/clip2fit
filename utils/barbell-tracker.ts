const RING_BUFFER_SIZE = 60
const DRIFT_THRESHOLD = 0.05 // normalized coordinate

type BarPosition = { x: number; y: number; timestamp: number }

export const createBarbellTracker = () => {
  const path: BarPosition[] = []
  let startX: number | null = null

  const addFrame = (
    jointMap: Record<string, { x: number; y: number }>,
  ): {
    position: { x: number; y: number } | null
    path: BarPosition[]
    isDrifting: boolean
    driftDirection: 'left' | 'right' | 'none'
    driftAmount: number
  } | null => {
    const lw = jointMap['leftWrist']
    const rw = jointMap['rightWrist']

    if (lw === undefined || rw === undefined) {
      return null
    }

    const x = (lw.x + rw.x) / 2
    const y = (lw.y + rw.y) / 2
    const now = Date.now()

    path.push({ x, y, timestamp: now })
    if (path.length > RING_BUFFER_SIZE) {
      path.shift()
    }

    if (startX === null) {
      startX = x
    }

    const driftAmount = Math.abs(x - startX)
    const isDrifting = driftAmount > DRIFT_THRESHOLD
    const driftDirection: 'left' | 'right' | 'none' = !isDrifting
      ? 'none'
      : x < startX
        ? 'left'
        : 'right'

    return {
      position: { x, y },
      path: [...path],
      isDrifting,
      driftDirection,
      driftAmount,
    }
  }

  const reset = () => {
    path.length = 0
    startX = null
  }

  return { addFrame, reset }
}
