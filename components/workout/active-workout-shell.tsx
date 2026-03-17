import { useRouter } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Alert, View } from 'react-native'

import { OrbitDashboard } from '@/components/workout/timer-designs/orbit/orbit-dashboard'
import { useActiveWorkout } from '@/contexts/active-workout-context'

interface ActiveWorkoutShellProps {
  onBack: () => void
}

export const ActiveWorkoutShell = ({ onBack }: ActiveWorkoutShellProps) => {
  const router = useRouter()
  const { session, finishSession, clearSession, finishResult, clearFinishResult, editAction, clearEditAction } =
    useActiveWorkout()
  const navigatedToPrRef = useRef(false)

  const isEditMode = session?.status === 'completed'

  // Consume finishResult written by the finish-workout sheet route
  useEffect(() => {
    if (finishResult === null || session === null) return

    if (finishResult.prs.length > 0) {
      if (navigatedToPrRef.current) return
      navigatedToPrRef.current = true
      finishSession()
      router.replace('/(protected)/pr-celebration' as never)
    } else {
      clearFinishResult()
      finishSession()
      onBack()
    }
  }, [finishResult, session, clearFinishResult, finishSession, onBack, router])

  const handleFinish = () => {
    router.push('/(protected)/sheets/finish-workout')
  }

  const handleSave = () => {
    router.push('/(protected)/sheets/save-workout')
  }

  // Consume editAction written by the save-workout sheet route
  useEffect(() => {
    if (editAction === null) return
    clearEditAction()
    if (editAction === 'discarded') {
      clearSession()
    }
    onBack()
  }, [editAction, clearEditAction, clearSession, onBack])

  const handleBack = () => {
    if (session === null || session.status === 'completed') {
      onBack()
      return
    }
    Alert.alert(
      'Leave workout?',
      'Your progress will be lost.',
      [
        { text: 'Keep Going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => { clearSession(); onBack() } },
      ],
    )
  }

  if (session === null) return null

  return (
    <View className="flex-1">
      <OrbitDashboard
        onBack={handleBack}
        onFinish={isEditMode ? handleSave : handleFinish}
        isEditMode={isEditMode}
      />
    </View>
  )
}
