import { useEffect, useRef, useState } from 'react'

interface UseCountdownOptions {
  initialSeconds: number
  autoStart?: boolean
}

interface UseCountdownReturn {
  secondsLeft: number
  isActive: boolean
  start: () => void
  reset: () => void
}

export const useCountdown = ({ initialSeconds, autoStart = false }: UseCountdownOptions): UseCountdownReturn => {
  const [secondsLeft, setSecondsLeft] = useState(autoStart ? initialSeconds : 0)
  const [isActive, setIsActive] = useState(autoStart)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const cleanup = () => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const start = () => {
    cleanup()
    setSecondsLeft(initialSeconds)
    setIsActive(true)
  }

  const reset = () => {
    cleanup()
    setSecondsLeft(0)
    setIsActive(false)
  }

  useEffect(() => {
    if (!isActive || secondsLeft <= 0) {
      if (isActive && secondsLeft <= 0) {
        setIsActive(false)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          cleanup()
          setIsActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return cleanup
  }, [isActive, secondsLeft])

  useEffect(() => cleanup, [])

  return { secondsLeft, isActive, start, reset }
}
