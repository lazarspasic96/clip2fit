import { Text, View } from 'react-native'
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
  const saveLabel = mode === 'edit' ? 'Save Changes' : 'Save to Library'
  const discardLabel = mode === 'edit' ? 'Cancel' : 'Discard'

  return (
    <View
      className="px-5 pt-4 border-t border-border-primary bg-background-primary"
      style={{ paddingBottom: Math.max(insets.bottom, 16) }}
    >
      {saveError !== null && (
        <Text className="text-sm font-inter text-red-400 text-center mb-3">{saveError}</Text>
      )}
      <View className="gap-3">
        <Button onPress={onSave} loading={saving} disabled={exerciseCount === 0}>
          {saveLabel}
        </Button>
        <Button variant="ghost" onPress={onDiscard} disabled={saving}>
          {discardLabel}
        </Button>
      </View>
    </View>
  )
}
