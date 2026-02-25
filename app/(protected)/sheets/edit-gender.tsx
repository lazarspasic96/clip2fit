import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'

import { cn } from '@/components/ui/cn'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { Gender } from '@/types/profile'
import { GENDERS } from '@/types/profile'

const EditGenderScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [gender, setGender] = useState<Gender | undefined>(profile?.gender)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    if (gender === profile?.gender) {
      router.back()
      return
    }

    saveMutation.mutate({ gender }, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <Text className="text-lg font-inter-bold text-content-primary mb-6">Gender</Text>

      <View className="flex-row flex-wrap gap-2 mb-4">
        {GENDERS.map((option) => {
          const selected = gender === option.value
          return (
            <Pressable
              key={option.value}
              onPress={() => setGender(option.value)}
              className={cn(
                'px-4 py-2.5 rounded-md border',
                selected ? 'border-brand-accent bg-brand-accent/10' : 'border-border-primary',
              )}
            >
              <Text className={cn('text-sm font-inter-medium', selected ? 'text-brand-accent' : 'text-content-secondary')}>
                {option.label}
              </Text>
            </Pressable>
          )
        })}
      </View>

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Pressable
        onPress={handleSave}
        disabled={saving}
        className={cn('items-center justify-center rounded-md py-3.5 bg-background-button-primary mt-6', saving && 'opacity-50')}
      >
        <Text className="text-base font-inter-semibold text-content-button-primary">
          {saving ? 'Saving...' : 'Save'}
        </Text>
      </Pressable>
    </View>
  )
}

export default EditGenderScreen
