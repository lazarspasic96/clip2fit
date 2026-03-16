import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import { View } from 'react-native'

import { DevTimerDesignSwitcher } from '@/components/workout/dev-timer-design-switcher'
import { PrCelebration } from '@/components/workout/pr-celebration'
import { FloatPillDashboard } from '@/components/workout/timer-designs/float-pill/float-pill-dashboard'
import { OrbitDashboard } from '@/components/workout/timer-designs/orbit/orbit-dashboard'
import { PulseTickerDashboard } from '@/components/workout/timer-designs/pulse-ticker/pulse-ticker-dashboard'
import { useActiveWorkout } from '@/contexts/active-workout-context'
import { useFinishWorkout } from '@/hooks/use-finish-workout'
import { useTimerDesign } from '@/stores/timer-design-store'
import type { ApiPR } from '@/types/api'

interface ActiveWorkoutShellProps {
  onBack: () => void
}

const DASHBOARDS = {
  'pulse-ticker': PulseTickerDashboard,
  'orbit': OrbitDashboard,
  'float-pill': FloatPillDashboard,
} as const

export const ActiveWorkoutShell = ({ onBack }: ActiveWorkoutShellProps) => {
  const router = useRouter()
  const { session, finishSession, finishResult, clearFinishResult } = useActiveWorkout()
  const [prs, setPrs] = useState<ApiPR[]>([])
  const [showPrCelebration, setShowPrCelebration] = useState(false)
  const finishMutation = useFinishWorkout()
  const { design } = useTimerDesign()

  const isEditMode = session?.status === 'completed'

  // Consume finishResult written by the finish-workout sheet route
  useEffect(() => {
    if (finishResult === null || session === null) return
    clearFinishResult()

    if (finishResult.prs.length > 0) {
      const enrichedPrs = finishResult.prs.map((pr) => ({
        ...pr,
        exercise_name:
          pr.exercise_name ||
          session.plan.exercises.find((ex) => ex.id === pr.exercise_id)?.name ||
          'Unknown Exercise',
      }))
      setPrs(enrichedPrs)
      setShowPrCelebration(true)
    } else {
      finishSession()
      onBack()
    }
  }, [finishResult, session, clearFinishResult, finishSession, onBack])

  const handleFinish = () => {
    router.push('/(protected)/sheets/finish-workout')
  }

  const handleSave = () => {
    if (session === null) return
    finishMutation.mutate(session, {
      onSuccess: () => onBack(),
    })
  }

  const handlePrDismiss = () => {
    setShowPrCelebration(false)
    finishSession()
    onBack()
  }

  if (session === null) return null

  const Dashboard = DASHBOARDS[design]

  return (
    <View className="flex-1">
      <DevTimerDesignSwitcher />
      <Dashboard
        onBack={onBack}
        onFinish={isEditMode ? handleSave : handleFinish}
        isEditMode={isEditMode}
      />

      {showPrCelebration && <PrCelebration prs={prs} onDismiss={handlePrDismiss} />}
    </View>
  )
}
