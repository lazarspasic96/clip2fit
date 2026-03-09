import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, TextInput, View } from 'react-native'

import { Button } from '@/components/ui/button'
import { SheetTitle } from '@/components/ui/sheet-title'
import { Colors } from '@/constants/colors'
import { useDeleteAccount } from '@/hooks/use-delete-account'

const DeleteAccountScreen = () => {
  const router = useRouter()
  const [confirmText, setConfirmText] = useState('')
  const deleteMutation = useDeleteAccount()

  const loading = deleteMutation.isPending
  const error = deleteMutation.error instanceof Error ? deleteMutation.error.message : null

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  return (
    <View className="px-6 pb-8 pt-6">
      <SheetTitle>Delete Account</SheetTitle>

      <Text className="text-sm font-inter text-red-400 mt-4">
        This will permanently delete your account and all your data. This action cannot be undone.
      </Text>

      <TextInput
        className="mt-4 rounded-xl border border-border-primary bg-background-secondary px-4 py-3 text-base font-inter text-content-primary"
        placeholder="Type DELETE to confirm"
        placeholderTextColor={Colors.content.tertiary}
        value={confirmText}
        onChangeText={setConfirmText}
        autoCapitalize="characters"
        editable={!loading}
      />

      {error !== null && (
        <Text className="text-sm font-inter text-red-400 text-center mt-2">{error}</Text>
      )}

      <View className="flex-row gap-3 mt-6">
        <Button onPress={() => router.back()} disabled={loading} variant="secondary" size="sm" className="flex-1">
          Cancel
        </Button>
        <Button
          onPress={handleDelete}
          loading={loading}
          disabled={confirmText !== 'DELETE'}
          size="sm"
          className="flex-1 bg-red-500"
          textClassName="text-white"
        >
          Delete My Account
        </Button>
      </View>
    </View>
  )
}

export default DeleteAccountScreen
