import { Alert, Pressable, View } from 'react-native'
import { ChevronDown } from 'lucide-react-native'

import { DismissButton } from '@/components/ui/dismiss-button'
import { Colors } from '@/constants/colors'
import type { ConversionJobState } from '@/types/processing'

interface ProcessUrlHeaderProps {
  jobState: ConversionJobState
  onMinimize: () => void
  onClose: () => void
  onCancelWithConfirm: () => void
}

export const ProcessUrlHeader = ({ jobState, onMinimize, onClose, onCancelWithConfirm }: ProcessUrlHeaderProps) => {
  const handleXPress = () => {
    if (jobState === 'processing') {
      Alert.alert('Cancel conversion?', 'Progress will be lost. You can always try again.', [
        { text: 'Keep going', style: 'cancel' },
        {
          text: 'Yes, cancel',
          style: 'destructive',
          onPress: onCancelWithConfirm,
        },
      ])
      return
    }
    onClose()
  }

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Left: minimize button (processing only) */}
      <View style={{ width: 32 }}>
        {jobState === 'processing' && (
          <Pressable onPress={onMinimize} hitSlop={12} className="p-1">
            <ChevronDown size={24} color={Colors.content.primary} pointerEvents="none" />
          </Pressable>
        )}
      </View>

      {/* Right: X button */}
      <View style={{ width: 32, alignItems: 'flex-end' }}>
        <DismissButton onPress={handleXPress} />
      </View>
    </View>
  )
}
