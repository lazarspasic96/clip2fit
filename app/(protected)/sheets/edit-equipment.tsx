import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { Equipment } from '@/types/profile'
import { EQUIPMENT_OPTIONS } from '@/types/profile'

const AT_HOME_PRESET: Equipment[] = ['bodyweight', 'dumbbells', 'resistance_bands']
const FULL_GYM_PRESET: Equipment[] = EQUIPMENT_OPTIONS.map((o) => o.value)

const EditEquipmentScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [selected, setSelected] = useState<Equipment[]>(profile?.equipment ?? [])

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleToggle = (value: string) => {
    const eq = value as Equipment
    setSelected((prev) =>
      prev.includes(eq) ? prev.filter((v) => v !== eq) : [...prev, eq],
    )
  }

  const applyPreset = (preset: Equipment[]) => {
    const allMatch = preset.every((v) => selected.includes(v))
    setSelected(allMatch ? [] : preset)
  }

  const handleSave = () => {
    if (JSON.stringify(selected) === JSON.stringify(profile?.equipment ?? [])) {
      router.back()
      return
    }
    saveMutation.mutate({ equipment: selected }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Equipment</SheetTitle>

      <View className="flex-row gap-2 mb-4">
        <View className="flex-1">
          <Button variant="secondary" size="sm" onPress={() => applyPreset(AT_HOME_PRESET)}>
            At Home
          </Button>
        </View>
        <View className="flex-1">
          <Button variant="secondary" size="sm" onPress={() => applyPreset(FULL_GYM_PRESET)}>
            Full Gym
          </Button>
        </View>
      </View>

      <ChipGrid options={EQUIPMENT_OPTIONS} selected={selected} onToggle={handleToggle} columns={2} />

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditEquipmentScreen
