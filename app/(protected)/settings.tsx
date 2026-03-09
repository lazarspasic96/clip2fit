import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ProfileHeader } from '@/components/settings/profile-header'
import { SettingsRow } from '@/components/settings/settings-row'
import { SettingsSection } from '@/components/settings/settings-section'
import { Button } from '@/components/ui/button'
import { DismissButton } from '@/components/ui/dismiss-button'
import { Colors } from '@/constants/colors'
import { useAuth } from '@/contexts/auth-context'
import { useProfileQuery } from '@/hooks/use-profile-query'
import {
  displayActivityLevel,
  displayEquipment,
  displayExperience,
  displayFocusAreas,
  displayGender,
  displayGoal,
  displayInjuries,
  displayLocation,
  displaySchedule,
  displayTrainingStyles,
  formatDateOfBirth,
  formatHeight,
  formatWeight,
} from '@/utils/format-profile'

const SettingsScreen = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile, isLoading } = useProfileQuery()

  return (
    <View className="flex-1 bg-background-primary px-5" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">Settings</Text>
        <DismissButton onPress={() => router.back()} />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.brand.accent} size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName=" pt-2 pb-8" showsVerticalScrollIndicator={false}>
          <ProfileHeader fullName={profile?.fullName} email={user?.email} />

          <SettingsSection title="Personal Info">
            <SettingsRow
              label="Name"
              value={profile?.fullName}
              onPress={() => router.push('/(protected)/sheets/edit-name')}
            />
            <SettingsRow
              label="Gender"
              value={displayGender(profile?.gender)}
              onPress={() => router.push('/(protected)/sheets/edit-gender')}
            />
            <SettingsRow
              label="Date of Birth"
              value={formatDateOfBirth(profile?.dateOfBirth)}
              onPress={() => router.push('/(protected)/sheets/edit-date-of-birth')}
            />
          </SettingsSection>

          <SettingsSection title="Body Measurements">
            <SettingsRow
              label="Height"
              value={formatHeight(profile?.height, profile?.heightUnit)}
              onPress={() => router.push('/(protected)/sheets/edit-height')}
            />
            <SettingsRow
              label="Weight"
              value={formatWeight(profile?.weight, profile?.weightUnit)}
              onPress={() => router.push('/(protected)/sheets/edit-weight')}
            />
          </SettingsSection>

          <SettingsSection title="Training Profile">
            <SettingsRow
              label="Fitness Goal"
              value={displayGoal(profile?.fitnessGoal)}
              onPress={() => router.push('/(protected)/sheets/edit-fitness-goal')}
            />
            <SettingsRow
              label="Experience Level"
              value={displayExperience(profile?.experienceLevel)}
              onPress={() => router.push('/(protected)/sheets/edit-experience')}
            />
            <SettingsRow
              label="Activity Level"
              value={displayActivityLevel(profile?.activityLevel)}
              onPress={() => router.push('/(protected)/sheets/edit-activity-level')}
            />
          </SettingsSection>

          <SettingsSection title="Workout Setup">
            <SettingsRow
              label="Location"
              value={displayLocation(profile?.workoutLocation)}
              onPress={() => router.push('/(protected)/sheets/edit-workout-location')}
            />
            <SettingsRow
              label="Equipment"
              value={displayEquipment(profile?.equipment)}
              onPress={() => router.push('/(protected)/sheets/edit-equipment')}
            />
            <SettingsRow
              label="Schedule"
              value={displaySchedule(profile?.trainingFrequency, profile?.sessionDuration)}
              onPress={() => router.push('/(protected)/sheets/edit-schedule')}
            />
            <SettingsRow
              label="Training Styles"
              value={displayTrainingStyles(profile?.trainingStyles)}
              onPress={() => router.push('/(protected)/sheets/edit-training-style')}
            />
            <SettingsRow
              label="Focus Areas"
              value={displayFocusAreas(profile?.focusAreas)}
              onPress={() => router.push('/(protected)/sheets/edit-focus-areas')}
            />
            <SettingsRow
              label="Injuries"
              value={displayInjuries(profile?.injuries)}
              onPress={() => router.push('/(protected)/sheets/edit-injuries')}
            />
          </SettingsSection>

          <SettingsSection title="Account">
            <SettingsRow
              label="Delete Account"
              onPress={() => router.push('/(protected)/sheets/delete-account')}
              destructive
            />
          </SettingsSection>

          <View className="items-center pt-8" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <Button variant="secondary" onPress={signOut} className="rounded-xl">
              Sign Out
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  )
}

export default SettingsScreen
