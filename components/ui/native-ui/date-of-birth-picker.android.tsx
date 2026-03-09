import { Column, DateTimePicker, Host, Row, TextButton } from '@expo/ui/jetpack-compose'
import { fillMaxWidth, padding, paddingAll } from '@expo/ui/jetpack-compose/modifiers'
import { formatISO } from 'date-fns'
import * as Haptics from 'expo-haptics'
import { Calendar } from 'lucide-react-native'
import { useRef, useState } from 'react'
import { Keyboard, Modal, Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import {
  clampDobDate,
  dobMaxDate,
  formatDobDisplay,
  formatDobIso,
  type DobIsoDate,
  parseDobIso,
} from '@/utils/dob-date'

import { Label } from '../label'

const MAX_DATE = dobMaxDate()
const OPENING_DISMISS_GUARD_MS = 160

type PickerDialogState = 'idle' | 'opening' | 'open' | 'closing'

interface DateOfBirthPickerProps {
  value: DobIsoDate | undefined
  onChange: (date: DobIsoDate) => void
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
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const [draftDate, setDraftDate] = useState<Date>(MAX_DATE)
  const dialogStateRef = useRef<PickerDialogState>('idle')
  const openedAtMsRef = useRef(0)

  const hasError = error !== undefined

  const borderClass = hasError
    ? 'border-content-badge-error bg-background-secondary'
    : 'border-border-primary bg-background-secondary'

  const valueTextClass = value === undefined ? 'text-content-tertiary' : 'text-content-primary'
  const formattedValue = formatDobDisplay(value)

  const clampDate = (candidate: Date): Date => {
    return clampDobDate(candidate)
  }

  const closeDialog = () => {
    if (dialogStateRef.current === 'idle' || dialogStateRef.current === 'closing') return
    dialogStateRef.current = 'closing'
    setIsDialogVisible(false)
    requestAnimationFrame(() => {
      dialogStateRef.current = 'idle'
    })
  }

  const handleOpenPicker = () => {
    if (dialogStateRef.current !== 'idle') return

    Keyboard.dismiss()
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

    const parsed = value !== undefined ? parseDobIso(value) : null
    setDraftDate(clampDate(parsed ?? MAX_DATE))
    openedAtMsRef.current = Date.now()
    dialogStateRef.current = 'opening'
    setIsDialogVisible(true)

    requestAnimationFrame(() => {
      if (dialogStateRef.current === 'opening') {
        dialogStateRef.current = 'open'
      }
    })
  }

  const handleDismissRequest = () => {
    if (dialogStateRef.current === 'opening' && Date.now() - openedAtMsRef.current < OPENING_DISMISS_GUARD_MS) {
      return
    }
    closeDialog()
  }

  const handleCancel = () => {
    closeDialog()
  }

  const handleDone = () => {
    const clamped = clampDate(draftDate)
    const nextValue = formatDobIso(clamped)
    if (value === undefined || nextValue !== value) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onChange(nextValue)
    }
    closeDialog()
  }

  const handleDateSelected = (selectedDate: Date) => {
    setDraftDate(clampDate(selectedDate))
  }

  return (
    <View className="gap-1.5">
      <Label text={label} />

      <Pressable
        onPress={handleOpenPicker}
        accessibilityRole="button"
        accessibilityLabel="Select your date of birth"
        className={`flex-row items-center rounded-lg border px-4 py-4 ${borderClass}`}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <Calendar size={20} color={Colors.content.tertiary} pointerEvents="none" />
        <Text className={`ml-3 flex-1 text-base font-inter ${valueTextClass}`}>{formattedValue ?? placeholder}</Text>
      </Pressable>

      {hasError && <Text className="text-sm font-inter text-content-badge-error mt-1">{error}</Text>}

      <Modal visible={isDialogVisible} transparent animationType="fade" onRequestClose={handleDismissRequest}>
        <View className="flex-1 items-center justify-center px-1" style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)' }}>
          <Pressable className="absolute inset-0" onPress={handleDismissRequest} />

          <View className="overflow-hidden rounded-2xl bg-background-secondary">
            <Host colorScheme="dark" useViewportSizeMeasurement>
              <Column modifiers={[fillMaxWidth(), paddingAll(4)]}>
                <DateTimePicker
                  initialDate={formatISO(draftDate)}
                  displayedComponents="date"
                  variant="picker"
                  showVariantToggle={false}
                  color={Colors.brand.accent}
                  onDateSelected={handleDateSelected}
                  modifiers={[fillMaxWidth()]}
                />
                <Row horizontalArrangement="end" modifiers={[fillMaxWidth(), padding(0, 6, 0, 2)]}>
                  <TextButton color={Colors.content.secondary} onPress={handleCancel}>
                    Cancel
                  </TextButton>
                  <TextButton color={Colors.brand.accent} onPress={handleDone}>
                    Done
                  </TextButton>
                </Row>
              </Column>
            </Host>
          </View>
        </View>
      </Modal>
    </View>
  )
}
