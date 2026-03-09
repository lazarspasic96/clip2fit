import { useRouter } from 'expo-router'
import { Armchair, Bike, Flame, Footprints } from 'lucide-react-native'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { SelectionCard } from '@/components/onboarding/selection-card'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { ActivityLevel } from '@/types/profile'
import { ACTIVITY_LEVELS } from '@/types/profile'

const ICONS = [Armchair, Footprints, Bike, Flame] as const

const EditActivityLevelScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [level, setLevel] = useState<ActivityLevel | undefined>(profile?.activityLevel)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (level === profile?.activityLevel) {
      router.back()
      return
    }
    saveMutation.mutate({ activityLevel: level }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Activity Level</SheetTitle>

      <View className="gap-3">
        {ACTIVITY_LEVELS.map((option, index) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[index]}
            title={option.label}
            selected={level === option.value}
            onPress={() => setLevel(option.value)}
          />
        ))}
      </View>

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditActivityLevelScreen
