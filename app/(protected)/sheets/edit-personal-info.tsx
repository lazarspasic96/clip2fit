import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { DateOfBirthPicker } from '@/components/ui/native-ui/date-of-birth-picker'
import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { Gender, UserProfile } from '@/types/profile'
import { GENDERS } from '@/types/profile'
import { dobToAge, formatDateToISO } from '@/utils/format-profile'
import { computeProfileDiff } from '@/utils/profile-diff'

const EditPersonalInfoScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const currentValues: Partial<UserProfile> = profile ?? {}

  const [fullName, setFullName] = useState(currentValues.fullName ?? '')
  const [gender, setGender] = useState<Gender | undefined>(currentValues.gender)
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(
    currentValues.dateOfBirth !== undefined ? new Date(currentValues.dateOfBirth + 'T00:00:00') : undefined,
  )
  const [validationError, setValidationError] = useState<string | null>(null)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    const trimmedName = fullName.trim()
    if (trimmedName.length === 0) {
      setValidationError('Name is required')
      return
    }
    if (trimmedName.length > 100) {
      setValidationError('Name must be 100 characters or less')
      return
    }
    if (dateOfBirth !== undefined) {
      const age = dobToAge(dateOfBirth.toISOString().split('T')[0])
      if (age < 13 || age > 120) {
        setValidationError('Age must be between 13 and 120')
        return
      }
    }
    setValidationError(null)

    const updated: Partial<UserProfile> = {
      fullName: trimmedName,
      gender,
      ...(dateOfBirth !== undefined ? { dateOfBirth: formatDateToISO(dateOfBirth) } : {}),
    }

    const diff = computeProfileDiff(currentValues, updated)
    if (Object.keys(diff).length === 0) {
      router.back()
      return
    }

    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-lg font-inter-bold text-content-primary mb-6">Personal Info</Text>

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        placeholder="Enter your name"
        style={inputStyle}
        placeholderTextColor={Colors.content.tertiary}
      />

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5 mt-4">Gender</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {GENDERS.map((option) => {
          const selected = gender === option.value
          return (
            <Pressable
              key={option.value}
              onPress={() => setGender(option.value)}
              className={cn(
                'px-4 py-2.5 rounded-md border',
                selected ? 'border-brand-accent bg-brand-accent/10' : 'border-border-primary',
              )}
            >
              <Text className={cn('text-sm font-inter-medium', selected ? 'text-brand-accent' : 'text-content-secondary')}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <View className="mt-4">
        <DateOfBirthPicker value={dateOfBirth} onChange={setDateOfBirth} />
      </View>

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
    </ScrollView>
  )
}

const inputStyle = {
  backgroundColor: Colors.background.tertiary,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: Colors.content.primary,
}

export default EditPersonalInfoScreen
