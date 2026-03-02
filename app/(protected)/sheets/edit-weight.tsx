import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { SheetTitle } from '@/components/ui/sheet-title'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Colors } from '@/constants/colors'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { UserProfile, WeightUnit } from '@/types/profile'
import { computeProfileDiff } from '@/utils/profile-diff'

const WEIGHT_UNITS = [
  { label: 'kg', value: 'kg' as const },
  { label: 'lbs', value: 'lbs' as const },
]

const EditWeightScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const currentValues: Partial<UserProfile> = profile ?? {}

  const [weightUnit, setWeightUnit] = useState<WeightUnit>(currentValues.weightUnit ?? 'kg')
  const [weight, setWeight] = useState(currentValues.weight !== undefined ? String(currentValues.weight) : '')
  const [validationError, setValidationError] = useState<string | null>(null)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    const updated: Partial<UserProfile> = { weightUnit }

    if (weight.length > 0) {
      const val = parseFloat(weight)
      if (isNaN(val) || val <= 0 || val > 700) {
        setValidationError('Weight must be between 1 and 700')
        return
      }
      updated.weight = val
    }

    setValidationError(null)

    const diff = computeProfileDiff(currentValues, updated)
    if (Object.keys(diff).length === 0) {
      router.back()
      return
    }

    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Weight</SheetTitle>

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-inter-semibold text-content-secondary">Unit</Text>
        <View className="w-28">
          <SegmentedControl options={WEIGHT_UNITS} value={weightUnit} onChange={setWeightUnit} />
        </View>
      </View>

      <TextInput
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        autoFocus
        placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
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

export default EditWeightScreen
