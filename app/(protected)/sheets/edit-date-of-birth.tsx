import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { DateOfBirthPicker } from '@/components/ui/native-ui/date-of-birth-picker'
import { cn } from '@/components/ui/cn'
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
      <Text className="text-lg font-inter-bold text-content-primary mb-6">Date of Birth</Text>

      <DateOfBirthPicker value={dateOfBirth} onChange={setDateOfBirth} />

      {(validationError !== null || apiError !== null) && (
        <Text className="text-sm font-inter text-red-400 mt-3">{validationError ?? apiError}</Text>
      )}

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

export default EditDateOfBirthScreen
