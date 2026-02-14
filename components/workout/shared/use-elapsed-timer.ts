import { useEffect, useState } from 'react'

import { useActiveWorkout } from '@/contexts/active-workout-context'
import { formatTime } from '@/components/workout/shared/format-time'

export const useElapsedTimer = () => {
  const { session } = useActiveWorkout()
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (session === null) return

    const tick = () => {
      setElapsedSeconds(Math.floor((Date.now() - session.startedAt) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [session])

  return { elapsedSeconds, formatted: formatTime(elapsedSeconds) }
}
