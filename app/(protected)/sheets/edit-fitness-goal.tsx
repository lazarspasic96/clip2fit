import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
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
      <Text className="text-lg font-inter-bold text-content-primary mb-6">Fitness Goal</Text>

      <RadioGroup options={FITNESS_GOALS} value={goal} onChange={setGoal} />

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        className={cn('items-center justify-center rounded-md py-3.5 bg-background-button-primary mt-6', saving && 'opacity-50')}
      >
        <Text className="text-base font-inter-semibold text-content-button-primary">
          {saving ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
    </View>
  )
}

export default EditFitnessGoalScreen
