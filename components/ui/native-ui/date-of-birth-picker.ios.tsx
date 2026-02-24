import { subYears } from 'date-fns'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { formatDateOfBirth } from '@/utils/format-profile'
import { DatePicker, Host } from '@expo/ui/swift-ui'

import { Label } from '../label'

const NOW = new Date()
const MIN_DATE = subYears(NOW, 120)
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
  const [open, setOpen] = useState(false)

  const displayText = value !== undefined ? formatDateOfBirth(value) : undefined

  return (
    <View className="gap-1.5">
      <Label text={label} />
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={{
          backgroundColor: Colors.background.tertiary,
          borderRadius: 8,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: displayText !== undefined ? Colors.content.primary : Colors.content.tertiary,
          }}
        >
          {displayText ?? placeholder}
        </Text>
      </Pressable>

      {open && (
        <Host matchContents colorScheme="dark" style={{ marginTop: 8 }}>
          <DatePicker
            selection={value ?? MAX_DATE}
            onDateChange={onChange}
            displayedComponents={['date']}
            range={{ start: MIN_DATE, end: MAX_DATE }}
          />
        </Host>
      )}

      {error !== undefined && (
        <Text className="text-sm font-inter text-red-400 mt-1">{error}</Text>
      )}
    </View>
  )
}
