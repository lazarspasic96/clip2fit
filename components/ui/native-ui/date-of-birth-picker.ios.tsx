import { subYears } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { Calendar } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { DatePicker, Host } from '@expo/ui/swift-ui'
import { datePickerStyle, labelsHidden, tint } from '@expo/ui/swift-ui/modifiers'

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
  const hasError = error !== undefined

  const borderClass = hasError
    ? 'border-content-badge-error bg-background-secondary'
    : 'border-border-primary bg-background-secondary'

  const handleDateChange = (date: Date) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(date)
  }

  const handleInitialSelect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onChange(MAX_DATE)
  }

  return (
    <View className="gap-1.5">
      <Label text={label} />

      {value === undefined ? (
        <Pressable
          onPress={handleInitialSelect}
          accessibilityRole="button"
          accessibilityLabel="Select your date of birth"
          className={`flex-row items-center rounded-lg border px-4 py-4 ${borderClass}`}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
        >
          <Calendar
            size={20}
            color={Colors.content.tertiary}
            pointerEvents="none"
          />
          <Text className="ml-3 flex-1 text-base font-inter text-content-tertiary">
            {placeholder}
          </Text>
        </Pressable>
      ) : (
        <View className={`flex-row items-center rounded-lg border px-4 py-3 ${borderClass}`}>
          <Calendar
            size={20}
            color={Colors.content.tertiary}
            pointerEvents="none"
          />
          <View className="ml-3">
            <Host matchContents colorScheme="dark">
              <DatePicker
                selection={value}
                onDateChange={handleDateChange}
                displayedComponents={['date']}
                range={{ start: MIN_DATE, end: MAX_DATE }}
                modifiers={[
                  datePickerStyle('compact'),
                  tint(Colors.brand.accent),
                  labelsHidden(),
                ]}
              />
            </Host>
          </View>
        </View>
      )}

      {hasError && (
        <Text className="text-sm font-inter text-content-badge-error mt-1">{error}</Text>
      )}
    </View>
  )
}
