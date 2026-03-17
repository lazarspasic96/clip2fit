import { BlurView } from 'expo-blur'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'

interface ProposalActionsProps {
  onSave: () => void
  onDiscard: () => void
  saving: boolean
  saveError: string | null
  exerciseCount: number
  mode?: 'proposal' | 'edit'
}

export const ProposalActions = ({
  onSave,
  onDiscard,
  saving,
  saveError,
  exerciseCount,
  mode = 'proposal',
}: ProposalActionsProps) => {
  const insets = useSafeAreaInsets()
  const saveLabel = mode === 'edit' ? 'Save Changes' : 'Save'
  const discardLabel = mode === 'edit' ? 'Cancel' : 'Discard'

  return (
    <View
      className="border-t border-border-primary overflow-hidden"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <BlurView
        intensity={80}
        tint="dark"
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      />
      {saveError !== null && <Text className="text-sm font-inter text-red-400 text-center mb-3 px-5 pt-3">{saveError}</Text>}
      <View className="flex-row gap-3 px-5 py-3">
        <Button
          variant="ghost"
          onPress={onDiscard}
          disabled={saving}
          className="flex-1 border border-border-primary"
          textClassName="text-content-primary"
        >
          {discardLabel}
        </Button>
        <Button onPress={onSave} loading={saving} disabled={exerciseCount === 0} className="flex-1">
          {saveLabel}
        </Button>
      </View>
    </View>
  )
}
