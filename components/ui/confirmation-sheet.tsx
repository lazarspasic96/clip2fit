import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useEffect, useRef } from 'react'
import { Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'

interface ConfirmationSheetProps {
  visible: boolean
  title: string
  description: string
  cancelLabel?: string
  confirmLabel: string
  onCancel: () => void
  onConfirm: () => void
  loading?: boolean
  error?: string | null
}

export const ConfirmationSheet = ({
  visible,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  onCancel,
  onConfirm,
  loading = false,
  error = null,
}: ConfirmationSheetProps) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present()
    } else {
      bottomSheetRef.current?.dismiss()
    }
  }, [visible])

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      onDismiss={onCancel}
      backgroundStyle={{ backgroundColor: Colors.background.secondary }}
      handleIndicatorStyle={{ backgroundColor: Colors.content.tertiary }}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} opacity={0.6} pressBehavior="close" appearsOnIndex={0} disappearsOnIndex={-1} />
      )}
    >
      <BottomSheetView style={{ paddingHorizontal: 24, paddingBottom: 32, paddingTop: 8 }}>
        <Text className="text-lg font-inter-bold text-content-primary text-center">{title}</Text>
        <Text className="text-sm font-inter text-content-secondary text-center mt-2">{description}</Text>

        {error !== null && error !== undefined && (
          <Text className="text-sm font-inter text-red-400 text-center mt-2">{error}</Text>
        )}

        <View className="flex-row gap-3 mt-6">
          <Pressable onPress={onCancel} disabled={loading} className="flex-1 rounded-md py-2.5 bg-background-tertiary">
            <Text className="text-sm font-inter-semibold text-content-primary text-center">{cancelLabel}</Text>
          </Pressable>
          <Pressable onPress={onConfirm} disabled={loading} className="flex-1 rounded-md py-2.5 bg-red-600">
            <Text className="text-sm font-inter-semibold text-content-primary text-center">
              {loading ? `${confirmLabel}...` : confirmLabel}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  )
}
