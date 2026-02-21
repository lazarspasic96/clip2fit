import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import * as Haptics from 'expo-haptics'
import { CalendarDays, XCircle } from 'lucide-react-native'
import { forwardRef } from 'react'
import { Text, View } from 'react-native'

import { OptionRow } from '@/components/schedule/option-row'
import { Colors } from '@/constants/colors'
import type { DayOfWeek, ScheduleEntry } from '@/types/schedule'
import { DAY_LABELS } from '@/utils/schedule'

interface DayOptionsSheetProps {
  dayOfWeek: DayOfWeek | null
  entry: ScheduleEntry | null
  onChangeWorkout: () => void
  onAssignWorkout: () => void
  onClear: () => void
  onDismiss: () => void
}

export const DayOptionsSheet = forwardRef<BottomSheetModal, DayOptionsSheetProps>(
  ({ dayOfWeek, entry, onChangeWorkout, onAssignWorkout, onClear, onDismiss }, ref) => {
    const hasWorkout = entry !== null && entry.workoutId !== null

    const withHaptic = (fn: () => void) => () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      fn()
    }

    return (
      <BottomSheetModal
        ref={ref}
        enableDynamicSizing
        enablePanDownToClose
        onDismiss={onDismiss}
        backgroundStyle={{ backgroundColor: Colors.background.secondary }}
        handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
        )}
      >
        <BottomSheetView className="px-6 pb-8 pt-2">
          <Text className="text-lg font-inter-bold text-content-primary text-center mb-4">
            {dayOfWeek !== null ? DAY_LABELS[dayOfWeek] : ''}
          </Text>

          <View className="gap-2">
            {hasWorkout ? (
              <>
                <OptionRow
                  icon={<CalendarDays size={20} color={Colors.content.primary} pointerEvents="none" />}
                  label="Change Workout"
                  onPress={withHaptic(onChangeWorkout)}
                />
                <OptionRow
                  icon={<XCircle size={20} color={Colors.badge.error.content} pointerEvents="none" />}
                  label="Clear"
                  onPress={withHaptic(onClear)}
                  destructive
                />
              </>
            ) : (
              <OptionRow
                icon={<CalendarDays size={20} color={Colors.content.primary} pointerEvents="none" />}
                label="Assign Workout"
                onPress={withHaptic(onAssignWorkout)}
              />
            )}
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  },
)

DayOptionsSheet.displayName = 'DayOptionsSheet'
