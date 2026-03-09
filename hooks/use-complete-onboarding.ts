import { useAuth } from '@/contexts/auth-context'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { UserProfile } from '@/types/profile'
import { useRouter } from 'expo-router'
import { Alert } from 'react-native'

export const useCompleteOnboarding = () => {
  const { saveProfile, completeOnboarding, loading } = useAuth()
  const { getData, resetData } = useProfileForm()
  const router = useRouter()

  const complete = async (extraFields?: Partial<UserProfile>) => {
    if (extraFields !== undefined) {
      const profileData = { ...getData(), ...extraFields }
      const saveResult = await saveProfile(profileData)
      if (!saveResult.success) {
        Alert.alert('Error', saveResult.error ?? 'Failed to save profile')
        return
      }
    } else {
      const profileData = getData()
      if (Object.keys(profileData).length > 0) {
        const saveResult = await saveProfile(profileData)
        if (!saveResult.success) {
          Alert.alert('Error', saveResult.error ?? 'Failed to save profile')
          return
        }
      }
    }

    const result = await completeOnboarding()
    if (result.success) {
      resetData()
      router.replace('/(protected)/(tabs)' as never)
    } else {
      Alert.alert('Error', result.error ?? 'Failed to complete onboarding')
    }
  }

  return { complete, loading }
}
