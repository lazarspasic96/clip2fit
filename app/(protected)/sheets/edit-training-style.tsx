import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { TrainingStyle } from '@/types/profile'
import { TRAINING_STYLES } from '@/types/profile'

const EditTrainingStyleScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [selected, setSelected] = useState<TrainingStyle[]>(profile?.trainingStyles ?? [])

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleToggle = (value: string) => {
    const style = value as TrainingStyle
    setSelected((prev) =>
      prev.includes(style) ? prev.filter((v) => v !== style) : [...prev, style],
    )
  }

  const handleSave = () => {
    if (JSON.stringify(selected) === JSON.stringify(profile?.trainingStyles ?? [])) {
      router.back()
      return
    }
    saveMutation.mutate({ trainingStyles: selected }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Training Styles</SheetTitle>

      <ChipGrid options={TRAINING_STYLES} selected={selected} onToggle={handleToggle} />

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditTrainingStyleScreen
