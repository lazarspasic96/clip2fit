import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import { computeProfileDiff } from '@/utils/profile-diff'

const EditNameScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const currentFullName = profile?.fullName ?? ''
  const [fullName, setFullName] = useState(currentFullName)
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
    setValidationError(null)

    const diff = computeProfileDiff({ fullName: currentFullName }, { fullName: trimmedName })
    if (Object.keys(diff).length === 0) {
      router.back()
      return
    }

    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Name</SheetTitle>

      <Text className="text-sm font-inter-semibold text-content-secondary mb-1.5">Full Name</Text>
      <TextInput
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
        autoComplete="name"
        autoFocus
        placeholder="Enter your name"
        style={inputStyle}
        placeholderTextColor={Colors.content.tertiary}
      />

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

const inputStyle = {
  backgroundColor: Colors.background.tertiary,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: Colors.content.primary,
}

export default EditNameScreen
