import { subYears } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { Calendar, ChevronRight } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { formatDateOfBirth } from '@/utils/format-profile'
import { DateTimePicker, Host, ModalBottomSheet } from '@expo/ui/jetpack-compose'

import { Label } from '../label'

const NOW = new Date()
const MAX_DATE = subYears(NOW, 13)

interface DateOfBirthPickerProps {
  value: Date | undefined
  onChange: (date: Date) => void
  label?: string
  placeholder?: string
  error?: string
}

export const DateOfBirthPicker = ({
  value,
  onChange,
  label = 'Date of Birth',
  placeholder = 'Select your date of birth',
  error,
}: DateOfBirthPickerProps) => {
  const [showPicker, setShowPicker] = useState(false)

  const displayText = value !== undefined ? formatDateOfBirth(value) : undefined
  const hasError = error !== undefined

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    setShowPicker(true)
  }

  const handleDateSelected = (date: Date) => {
    onChange(date)
    setShowPicker(false)
  }

  return (
    <View className="gap-1.5">
      <Label text={label} />

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={
          displayText !== undefined
            ? `Date of birth: ${displayText}. Tap to change.`
            : 'Select your date of birth'
        }
        className={`flex-row items-center rounded-lg border px-4 py-4 ${
          hasError
            ? 'border-content-badge-error bg-background-secondary'
            : 'border-border-primary bg-background-secondary'
        }`}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Calendar
          size={20}
          color={Colors.content.tertiary}
          pointerEvents="none"
        />
        <Text
          className={`ml-3 flex-1 text-base font-inter ${
            displayText !== undefined ? 'text-content-primary' : 'text-content-tertiary'
          }`}
        >
          {displayText ?? placeholder}
        </Text>
        <ChevronRight
          size={16}
          color={Colors.content.tertiary}
          pointerEvents="none"
        />
      </Pressable>

      {showPicker && (
        <ModalBottomSheet
          onDismissRequest={() => setShowPicker(false)}
          skipPartiallyExpanded
        >
          <Host matchContents colorScheme="dark">
            <DateTimePicker
              initialDate={value?.toISOString() ?? MAX_DATE.toISOString()}
              onDateSelected={handleDateSelected}
              displayedComponents="date"
              variant="picker"
              showVariantToggle={false}
              color={Colors.brand.accent}
            />
          </Host>
        </ModalBottomSheet>
      )}

      {hasError && (
        <Text className="text-sm font-inter text-content-badge-error mt-1">{error}</Text>
      )}
    </View>
  )
}
