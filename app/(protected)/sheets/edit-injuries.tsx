import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { ChipGrid } from '@/components/onboarding/chip-grid'
import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { InjuryTag } from '@/types/profile'
import { INJURY_TAGS } from '@/types/profile'

const EXCLUSIVE_VALUES = ['none']

const EditInjuriesScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [selected, setSelected] = useState<InjuryTag[]>(profile?.injuries ?? [])
  const [notes, setNotes] = useState(profile?.injuryNotes ?? '')

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleToggle = (value: string) => {
    const tag = value as InjuryTag
    setSelected((prev) => {
      if (EXCLUSIVE_VALUES.includes(tag)) {
        return prev.includes(tag) ? [] : [tag]
      }
      const withoutExclusive = prev.filter((v) => !EXCLUSIVE_VALUES.includes(v))
      return withoutExclusive.includes(tag)
        ? withoutExclusive.filter((v) => v !== tag)
        : [...withoutExclusive, tag]
    })
  }

  const handleSave = () => {
    const toSave = selected.filter((v) => v !== 'none')
    const trimmedNotes = notes.trim()
    const notesValue = trimmedNotes.length > 0 ? trimmedNotes : undefined

    const injuriesChanged = JSON.stringify(toSave) !== JSON.stringify(profile?.injuries ?? [])
    const notesChanged = notesValue !== (profile?.injuryNotes ?? undefined)

    if (!injuriesChanged && !notesChanged) {
      router.back()
      return
    }

    const diff: Record<string, unknown> = {}
    if (injuriesChanged) diff.injuries = toSave
    if (notesChanged) diff.injuryNotes = notesValue
    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Injuries & Limitations</SheetTitle>

      <ChipGrid
        options={INJURY_TAGS}
        selected={selected}
        onToggle={handleToggle}
        exclusive={EXCLUSIVE_VALUES}
        columns={2}
      />

      <View className="mt-5">
        <Text className="text-sm font-inter-medium text-content-secondary mb-2">
          Anything else? (optional)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="E.g., recovering from shoulder surgery..."
          placeholderTextColor={Colors.content.tertiary}
          maxLength={200}
          multiline
          numberOfLines={3}
          className="bg-background-secondary border border-border-primary rounded-xl px-4 py-3 text-content-primary text-sm font-inter"
          style={{ minHeight: 80, textAlignVertical: 'top', borderCurve: 'continuous' }}
        />
      </View>

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditInjuriesScreen
