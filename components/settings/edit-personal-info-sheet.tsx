import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { Colors } from '@/constants/colors'
import type { Gender, UserProfile } from '@/types/profile'
import { GENDERS } from '@/types/profile'
import { computeProfileDiff } from '@/utils/profile-diff'

const screenHeight = Dimensions.get('window').height

interface EditPersonalInfoSheetProps {
  visible: boolean
  onDismiss: () => void
  currentValues: Partial<UserProfile>
  onSave: (data: Partial<UserProfile>) => void
  saving: boolean
  error?: string | null
}

export const EditPersonalInfoSheet = ({
  visible,
  onDismiss,
  currentValues,
  onSave,
  saving,
  error,
}: EditPersonalInfoSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [fullName, setFullName] = useState('')
  const [gender, setGender] = useState<Gender | undefined>()
  const [age, setAge] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      setFullName(currentValues.fullName ?? '')
      setGender(currentValues.gender)
      setAge(currentValues.age !== undefined ? String(currentValues.age) : '')
      setValidationError(null)
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

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
    if (age.length > 0) {
      const parsed = parseInt(age, 10)
      if (isNaN(parsed) || parsed < 13 || parsed > 120) {
        setValidationError('Age must be between 13 and 120')
        return
      }
    }
    setValidationError(null)

    const updated: Partial<UserProfile> = {
      fullName: trimmedName,
      gender,
      ...(age.length > 0 ? { age: parseInt(age, 10) } : {}),
    }

    const diff = computeProfileDiff(currentValues, updated)
    if (Object.keys(diff).length === 0) {
      onDismiss()
      return
    }

    onSave(diff)
  }

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      maxDynamicContentSize={screenHeight * 0.8}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-lg font-inter-bold text-content-primary mb-6">Personal Info</Text>

        <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Name</Text>
        <BottomSheetTextInput
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

        <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Age</Text>
        <BottomSheetTextInput
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          placeholder="e.g. 25"
          style={inputStyle}
          placeholderTextColor={Colors.content.tertiary}
        />

        {(validationError !== null || (error !== undefined && error !== null)) && (
          <Text className="text-sm font-inter text-red-400 mt-3">
            {validationError ?? error}
          </Text>
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
      </BottomSheetScrollView>
    </BottomSheetModal>
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
