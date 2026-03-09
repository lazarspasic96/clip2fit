import { useRouter } from 'expo-router'
import { ArrowLeftRight, Building, Home, Trees } from 'lucide-react-native'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { SelectionCard } from '@/components/onboarding/selection-card'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { WorkoutLocation } from '@/types/profile'
import { WORKOUT_LOCATIONS } from '@/types/profile'

const ICONS = {
  gym: Building,
  home: Home,
  both: ArrowLeftRight,
  outdoor: Trees,
} as const

const EditWorkoutLocationScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [location, setLocation] = useState<WorkoutLocation | undefined>(profile?.workoutLocation)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (location === profile?.workoutLocation) {
      router.back()
      return
    }
    saveMutation.mutate({ workoutLocation: location }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Workout Location</SheetTitle>

      <View className="gap-3">
        {WORKOUT_LOCATIONS.map((option) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[option.value]}
            title={option.label}
            selected={location === option.value}
            onPress={() => setLocation(option.value)}
          />
        ))}
      </View>

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditWorkoutLocationScreen
