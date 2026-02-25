import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Colors } from '@/constants/colors'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { HeightUnit, UserProfile } from '@/types/profile'
import { feetInchesToInches, inchesToFeetInches } from '@/utils/format-profile'
import { computeProfileDiff } from '@/utils/profile-diff'

const HEIGHT_UNITS = [
  { label: 'cm', value: 'cm' as const },
  { label: 'ft', value: 'ft' as const },
]

const EditHeightScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const currentValues: Partial<UserProfile> = profile ?? {}
  const initUnit = currentValues.heightUnit ?? 'cm'

  const [heightUnit, setHeightUnit] = useState<HeightUnit>(initUnit)
  const [heightCm, setHeightCm] = useState(
    initUnit === 'cm' && currentValues.height !== undefined ? String(currentValues.height) : '',
  )
  const [heightFeet, setHeightFeet] = useState(() => {
    if (initUnit === 'ft' && currentValues.height !== undefined) return String(inchesToFeetInches(currentValues.height).feet)
    return ''
  })
  const [heightInches, setHeightInches] = useState(() => {
    if (initUnit === 'ft' && currentValues.height !== undefined) return String(inchesToFeetInches(currentValues.height).inches)
    return ''
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    const updated: Partial<UserProfile> = { heightUnit }

    if (heightUnit === 'cm' && heightCm.length > 0) {
      const val = parseFloat(heightCm)
      if (isNaN(val) || val <= 0 || val > 300) {
        setValidationError('Height must be between 1 and 300 cm')
        return
      }
      updated.height = val
    } else if (heightUnit === 'ft') {
      const ft = heightFeet.length > 0 ? parseInt(heightFeet, 10) : 0
      const inches = heightInches.length > 0 ? parseInt(heightInches, 10) : 0
      if (ft === 0 && inches === 0) {
        // No height entered, skip
      } else {
        if (ft < 0 || ft > 8) {
          setValidationError('Feet must be between 0 and 8')
          return
        }
        if (inches < 0 || inches > 11) {
          setValidationError('Inches must be between 0 and 11')
          return
        }
        updated.height = feetInchesToInches(ft, inches)
      }
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
      <Text className="text-lg font-inter-bold text-content-primary mb-6">Height</Text>

      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-inter-semibold text-content-secondary">Unit</Text>
        <View className="w-28">
          <SegmentedControl options={HEIGHT_UNITS} value={heightUnit} onChange={setHeightUnit} />
        </View>
      </View>

      {heightUnit === 'cm' ? (
        <TextInput
          value={heightCm}
          onChangeText={setHeightCm}
          keyboardType="decimal-pad"
          autoFocus
          placeholder="e.g. 175"
          style={inputStyle}
          placeholderTextColor={Colors.content.tertiary}
        />
      ) : (
        <View className="flex-row gap-3">
          <View className="flex-1 flex-row items-center">
            <TextInput
              value={heightFeet}
              onChangeText={setHeightFeet}
              keyboardType="number-pad"
              autoFocus
              placeholder="5"
              style={[inputStyle, { flex: 1 }]}
              placeholderTextColor={Colors.content.tertiary}
            />
            <Text className="text-base font-inter text-content-secondary ml-2">{`'`}</Text>
          </View>
          <View className="flex-1 flex-row items-center">
            <TextInput
              value={heightInches}
              onChangeText={setHeightInches}
              keyboardType="number-pad"
              placeholder="10"
              style={[inputStyle, { flex: 1 }]}
              placeholderTextColor={Colors.content.tertiary}
            />
            <Text className="text-base font-inter text-content-secondary ml-2">{`"`}</Text>
          </View>
        </View>
      )}

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

export default EditHeightScreen
