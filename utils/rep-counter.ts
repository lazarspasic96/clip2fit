type RepPhase = 'resting' | 'descending' | 'bottom' | 'ascending'

const DEBOUNCE_FRAMES = 15

type RepCounterConfig = {
  top: number
  bottom: number
}

export const createRepCounter = (config: RepCounterConfig) => {
  let phase: RepPhase = 'resting'
  let repCount = 0
  let framesSinceTransition = 0
  let bottomTimestamp: number | null = null
  let lastConcentricMs: number | null = null

  const addFrame = (angle: number): { counted: boolean; currentPhase: RepPhase; concentricMs: number | null } => {
    framesSinceTransition += 1
    const debounced = framesSinceTransition < DEBOUNCE_FRAMES
    let counted = false
    let concentricMs: number | null = null

    switch (phase) {
      case 'resting':
        if (!debounced && angle < config.top - 10) {
          phase = 'descending'
          framesSinceTransition = 0
        }
        break
      case 'descending':
        if (angle <= config.bottom) {
          phase = 'bottom'
          bottomTimestamp = Date.now()
          framesSinceTransition = 0
        } else if (!debounced && angle >= config.top) {
          phase = 'resting'
          framesSinceTransition = 0
        }
        break
      case 'bottom':
        if (!debounced && angle > config.bottom + 10) {
          phase = 'ascending'
          framesSinceTransition = 0
        }
        break
      case 'ascending':
        if (angle >= config.top - 15) {
          phase = 'resting'
          repCount += 1
          counted = true
          if (bottomTimestamp !== null) {
            lastConcentricMs = Date.now() - bottomTimestamp
            concentricMs = lastConcentricMs
          }
          bottomTimestamp = null
          framesSinceTransition = 0
        } else if (!debounced && angle <= config.bottom) {
          phase = 'bottom'
          bottomTimestamp = Date.now()
          framesSinceTransition = 0
        }
        break
    }

    return { counted, currentPhase: phase, concentricMs }
  }

  const reset = () => {
    phase = 'resting'
    repCount = 0
    framesSinceTransition = 0
    bottomTimestamp = null
    lastConcentricMs = null
  }

  const getRepCount = () => repCount
  const getLastConcentricMs = () => lastConcentricMs

  return { addFrame, reset, getRepCount, getLastConcentricMs }
}
