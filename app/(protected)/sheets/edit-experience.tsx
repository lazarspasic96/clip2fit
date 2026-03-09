import { useRouter } from 'expo-router'
import { Flame, Sprout, Trophy } from 'lucide-react-native'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { SelectionCard } from '@/components/onboarding/selection-card'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { ExperienceLevel } from '@/types/profile'
import { EXPERIENCE_LEVELS } from '@/types/profile'

const ICONS = {
  beginner: Sprout,
  intermediate: Flame,
  advanced: Trophy,
} as const

const EditExperienceScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [level, setLevel] = useState<ExperienceLevel | undefined>(profile?.experienceLevel)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (level === profile?.experienceLevel) {
      router.back()
      return
    }
    saveMutation.mutate({ experienceLevel: level }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Experience Level</SheetTitle>

      <View className="gap-3">
        {EXPERIENCE_LEVELS.map((option) => (
          <SelectionCard
            key={option.value}
            icon={ICONS[option.value]}
            title={option.label}
            subtitle={option.subtitle}
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

export default EditExperienceScreen
