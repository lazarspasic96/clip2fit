import type { FormIssue, FormSeverity } from '@/types/form-rules'

type RepScore = {
  issues: FormIssue[]
  overallSeverity: FormSeverity
}

export type FormSample = {
  timestamp: number
  issues: FormIssue[]
  evaluatedRules: string[]
  worstSeverity: FormSeverity
}

type SetData = {
  reps: number
  repScores: RepScore[]
  formSamples: FormSample[]
  startedAt: number
  finishedAt: number | null
}

type FormSession = {
  exerciseName: string
  sets: SetData[]
  currentSet: SetData | null
}

let session: FormSession | null = null
let version = 0
const listeners = new Set<() => void>()

const notify = () => {
  version += 1
  listeners.forEach((l) => l())
}

const createEmptySet = (): SetData => ({
  reps: 0,
  repScores: [],
  formSamples: [],
  startedAt: Date.now(),
  finishedAt: null,
})

export const formSessionStore = {
  startExercise: (exerciseName: string) => {
    session = {
      exerciseName,
      sets: [],
      currentSet: createEmptySet(),
    }
    notify()
  },

  recordRep: (issues: FormIssue[]) => {
    if (session === null || session.currentSet === null) return
    const overallSeverity: FormSeverity =
      issues.some((i) => i.severity === 'error') ? 'error'
      : issues.some((i) => i.severity === 'warning') ? 'warning'
      : 'good'

    session.currentSet.reps += 1
    session.currentSet.repScores.push({ issues: [...issues], overallSeverity })
    notify()
  },

  recordFormSample: (issues: FormIssue[], evaluatedRules: string[]) => {
    if (session === null || session.currentSet === null) return
    const worstSeverity: FormSeverity =
      issues.some((i) => i.severity === 'error') ? 'error'
      : issues.some((i) => i.severity === 'warning') ? 'warning'
      : 'good'

    session.currentSet.formSamples.push({
      timestamp: Date.now(),
      issues: [...issues],
      evaluatedRules: [...evaluatedRules],
      worstSeverity,
    })
    // No notify() — avoid 15fps re-renders from the eval loop
  },

  finishSet: () => {
    if (session === null || session.currentSet === null) return
    session.currentSet.finishedAt = Date.now()
    session.sets.push(session.currentSet)
    session.currentSet = createEmptySet()
    notify()
  },

  finalizeSession: () => {
    if (session === null || session.currentSet === null) return
    const current = session.currentSet
    if (current.reps > 0 || current.formSamples.length > 0) {
      current.finishedAt = Date.now()
      session.sets.push(current)
    }
    session.currentSet = null
    notify()
  },

  switchExercise: (exerciseName: string) => {
    if (session !== null && session.currentSet !== null && session.currentSet.reps > 0) {
      session.currentSet.finishedAt = Date.now()
      session.sets.push(session.currentSet)
    }
    session = {
      exerciseName,
      sets: session !== null ? session.sets : [],
      currentSet: createEmptySet(),
    }
    notify()
  },

  getSession: () => session,

  getCurrentSetReps: () => session?.currentSet?.reps ?? 0,

  getLastFinishedSet: (): SetData | null => {
    if (session === null || session.sets.length === 0) return null
    return session.sets[session.sets.length - 1]
  },

  getTotalReps: () => {
    if (session === null) return 0
    const setReps = session.sets.reduce((sum, s) => sum + s.reps, 0)
    return setReps + (session.currentSet?.reps ?? 0)
  },

  reset: () => {
    session = null
    notify()
  },

  subscribe: (listener: () => void) => {
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  },

  getSnapshot: (): number => version,
}
