import { Button } from '@/components/ui/button'
import { RadioGroup } from '@/components/ui/radio-group'
import { Colors } from '@/constants/colors'
import { useAuth } from '@/contexts/auth-context'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { FitnessGoal } from '@/types/profile'
import { FITNESS_GOALS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { ChevronLeft } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const GoalScreen = () => {
  const router = useRouter()
  const { saveProfile, completeOnboarding, loading } = useAuth()
  const { updateField, getData, resetData } = useProfileForm()
  const insets = useSafeAreaInsets()
  const [goal, setGoal] = useState<FitnessGoal | undefined>()

  const saveAndNavigate = async () => {
    if (goal) updateField('fitnessGoal', goal)
    const profileData = getData()
    saveProfile(profileData)
    const result = await completeOnboarding()
    if (result.success) {
      resetData()
      router.replace('/(protected)/(tabs)' as never)
    } else {
      Alert.alert('Error', result.error ?? 'Failed to complete onboarding')
    }
  }

  const onSkip = async () => {
    const profileData = getData()
    if (Object.keys(profileData).length > 0) {
      saveProfile(profileData)
    }
    const result = await completeOnboarding()
    if (result.success) {
      resetData()
      router.replace('/(protected)/(tabs)' as never)
    } else {
      Alert.alert('Error', result.error ?? 'Failed to complete onboarding')
    }
  }

  return (
    <View className="flex-1 bg-background-primary">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} hitSlop={12} className="p-1 self-start mb-4">
          <ChevronLeft size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>

        <Text className="text-2xl font-inter-bold text-content-primary mb-2">What&apos;s your goal?</Text>
        <Text className="text-base font-inter text-content-secondary mb-8">
          Choose what best describes your fitness goal.
        </Text>

        <RadioGroup options={FITNESS_GOALS} value={goal} onChange={setGoal} />
      </ScrollView>

      <View className="px-6 mb-6 gap-3" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
        <Button onPress={saveAndNavigate} loading={loading}>
          Complete
        </Button>
        <Button variant="ghost" onPress={onSkip} loading={loading}>
          Skip
        </Button>
      </View>
    </View>
  )
}

export default GoalScreen
