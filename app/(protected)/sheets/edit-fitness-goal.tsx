import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { RadioGroup } from '@/components/ui/radio-group'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { FitnessGoal } from '@/types/profile'
import { FITNESS_GOALS } from '@/types/profile'

const EditFitnessGoalScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [goal, setGoal] = useState<FitnessGoal | undefined>(profile?.fitnessGoal)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (goal === profile?.fitnessGoal) {
      router.back()
      return
    }

    saveMutation.mutate({ fitnessGoal: goal }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Fitness Goal</SheetTitle>

      <RadioGroup options={FITNESS_GOALS} value={goal} onChange={setGoal} />

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditFitnessGoalScreen
