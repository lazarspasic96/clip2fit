import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { DateOfBirthPicker } from '@/components/ui/native-ui/date-of-birth-picker'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import { isDobInAllowedRange, isDobIsoDate, type DobIsoDate } from '@/utils/dob-date'
import { computeProfileDiff } from '@/utils/profile-diff'

const EditDateOfBirthScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [dateOfBirth, setDateOfBirth] = useState<DobIsoDate | undefined>(
    profile?.dateOfBirth !== undefined && isDobIsoDate(profile.dateOfBirth)
      ? profile.dateOfBirth
      : undefined,
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (dateOfBirth !== undefined && !isDobInAllowedRange(dateOfBirth)) {
      setValidationError('Age must be between 13 and 120')
      return
    }
    setValidationError(null)

    const updated = dateOfBirth !== undefined ? { dateOfBirth } : {}
    const current = profile?.dateOfBirth !== undefined ? { dateOfBirth: profile.dateOfBirth } : {}

    const diff = computeProfileDiff(current, updated)
    if (Object.keys(diff).length === 0) {
      router.back()
      return
    }

    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Date of Birth</SheetTitle>

      <DateOfBirthPicker value={dateOfBirth} onChange={setDateOfBirth} />

      {(validationError !== null || apiError !== null) && (
        <Text className="text-sm font-inter text-red-400 mt-3">{validationError ?? apiError}</Text>
      )}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditDateOfBirthScreen
