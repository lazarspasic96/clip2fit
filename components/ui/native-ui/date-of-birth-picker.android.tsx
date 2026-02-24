import { Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { formatDateOfBirth } from '@/utils/format-profile'
import { DateTimePicker, Host } from '@expo/ui/jetpack-compose'

import { Label } from '../label'


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
  const displayText = value !== undefined ? formatDateOfBirth(value) : undefined

  return (
    <View className="gap-1.5">
      <Label text={label} />
      <Host matchContents colorScheme="dark">
        <DateTimePicker
          initialDate={value?.toISOString() ?? null}
          onDateSelected={onChange}
          displayedComponents="date"
          variant="input"
          showVariantToggle={false}
        />
      </Host>

      {displayText === undefined && (
        <Text style={{ fontSize: 14, color: Colors.content.tertiary }}>{placeholder}</Text>
      )}

      {error !== undefined && (
        <Text className="text-sm font-inter text-red-400 mt-1">{error}</Text>
      )}
    </View>
  )
}
