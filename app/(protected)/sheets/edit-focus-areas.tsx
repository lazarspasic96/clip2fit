import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { FocusArea } from '@/types/profile'
import { FOCUS_AREAS } from '@/types/profile'

const EXCLUSIVE_VALUES = ['full_body']

const EditFocusAreasScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [selected, setSelected] = useState<FocusArea[]>(profile?.focusAreas ?? [])

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleToggle = (value: string) => {
    const area = value as FocusArea
    setSelected((prev) => {
      if (EXCLUSIVE_VALUES.includes(area)) {
        return prev.includes(area) ? [] : [area]
      }
      const withoutExclusive = prev.filter((v) => !EXCLUSIVE_VALUES.includes(v))
      return withoutExclusive.includes(area)
        ? withoutExclusive.filter((v) => v !== area)
        : [...withoutExclusive, area]
    })
  }

  const handleSave = () => {
    if (JSON.stringify(selected) === JSON.stringify(profile?.focusAreas ?? [])) {
      router.back()
      return
    }
    saveMutation.mutate({ focusAreas: selected }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Focus Areas</SheetTitle>

      <ChipGrid
        options={FOCUS_AREAS}
        selected={selected}
        onToggle={handleToggle}
        exclusive={EXCLUSIVE_VALUES}
        columns={2}
      />

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditFocusAreasScreen
