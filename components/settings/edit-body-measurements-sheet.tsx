import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { useEffect, useRef, useState } from 'react'
import { Dimensions, Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Colors } from '@/constants/colors'
import type { HeightUnit, UserProfile, WeightUnit } from '@/types/profile'
import { feetInchesToInches, inchesToFeetInches } from '@/utils/format-profile'
import { computeProfileDiff } from '@/utils/profile-diff'

const screenHeight = Dimensions.get('window').height

const HEIGHT_UNITS = [
  { label: 'cm', value: 'cm' as const },
  { label: 'ft', value: 'ft' as const },
]
const WEIGHT_UNITS = [
  { label: 'kg', value: 'kg' as const },
  { label: 'lbs', value: 'lbs' as const },
]

interface EditBodyMeasurementsSheetProps {
  visible: boolean
  onDismiss: () => void
  currentValues: Partial<UserProfile>
  onSave: (data: Partial<UserProfile>) => void
  saving: boolean
  error?: string | null
}

export const EditBodyMeasurementsSheet = ({
  visible,
  onDismiss,
  currentValues,
  onSave,
  saving,
  error,
}: EditBodyMeasurementsSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')
  const [heightCm, setHeightCm] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')
  const [weight, setWeight] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (visible) {
      const unit = currentValues.heightUnit ?? 'cm'
      setHeightUnit(unit)
      if (unit === 'ft' && currentValues.height !== undefined) {
        const { feet, inches } = inchesToFeetInches(currentValues.height)
        setHeightFeet(String(feet))
        setHeightInches(String(inches))
        setHeightCm('')
      } else {
        setHeightCm(currentValues.height !== undefined ? String(currentValues.height) : '')
        setHeightFeet('')
        setHeightInches('')
      }
      setWeightUnit(currentValues.weightUnit ?? 'kg')
      setWeight(currentValues.weight !== undefined ? String(currentValues.weight) : '')
      setValidationError(null)
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible])

  const handleSave = () => {
    const updated: Partial<UserProfile> = { heightUnit, weightUnit }

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
        <Text className="text-lg font-inter-bold text-content-primary mb-6">Body Measurements</Text>

        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-sm font-inter-semibold text-content-secondary">Height</Text>
          <View className="w-28">
            <SegmentedControl options={HEIGHT_UNITS} value={heightUnit} onChange={setHeightUnit} />
          </View>
        </View>

        {heightUnit === 'cm' ? (
          <BottomSheetTextInput
            value={heightCm}
            onChangeText={setHeightCm}
            keyboardType="decimal-pad"
            placeholder="e.g. 175"
            style={inputStyle}
            placeholderTextColor={Colors.content.tertiary}
          />
        ) : (
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center">
              <BottomSheetTextInput
                value={heightFeet}
                onChangeText={setHeightFeet}
                keyboardType="number-pad"
                placeholder="5"
                style={[inputStyle, { flex: 1 }]}
                placeholderTextColor={Colors.content.tertiary}
              />
              <Text className="text-base font-inter text-content-secondary ml-2">{`'`}</Text>
            </View>
            <View className="flex-1 flex-row items-center">
              <BottomSheetTextInput
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

        <View className="flex-row items-center justify-between mb-2 mt-6">
          <Text className="text-sm font-inter-semibold text-content-secondary">Weight</Text>
          <View className="w-28">
            <SegmentedControl options={WEIGHT_UNITS} value={weightUnit} onChange={setWeightUnit} />
          </View>
        </View>

        <BottomSheetTextInput
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
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
