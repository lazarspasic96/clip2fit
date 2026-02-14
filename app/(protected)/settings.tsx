import { useRouter } from 'expo-router'
import { X } from 'lucide-react-native'
import { useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { EditBodyMeasurementsSheet } from '@/components/settings/edit-body-measurements-sheet'
import { EditFitnessGoalSheet } from '@/components/settings/edit-fitness-goal-sheet'
import { EditPersonalInfoSheet } from '@/components/settings/edit-personal-info-sheet'
import { ProfileHeader } from '@/components/settings/profile-header'
import { SettingsRow } from '@/components/settings/settings-row'
import { SettingsSection } from '@/components/settings/settings-section'
import { Button } from '@/components/ui/button'
import { Colors } from '@/constants/colors'
import { useAuth } from '@/contexts/auth-context'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import type { UserProfile } from '@/types/profile'
import { displayGender, displayGoal, formatHeight, formatWeight } from '@/utils/format-profile'

type ActiveSheet = 'personal' | 'body' | 'goal' | null

const SettingsScreen = () => {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { profile, isLoading } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null)

  const handleSave = (data: Partial<UserProfile>) => {
    saveMutation.mutate(data, {
      onSuccess: () => setActiveSheet(null),
    })
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-inter-bold text-content-primary">Settings</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} className="p-1">
          <X size={24} color={Colors.content.primary} pointerEvents="none" />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.brand.accent} size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1" contentContainerClassName="px-6 pt-2 pb-8">
          <ProfileHeader fullName={profile?.fullName} email={user?.email} />

          <SettingsSection title="Personal Info">
            <SettingsRow label="Name" value={profile?.fullName} onPress={() => setActiveSheet('personal')} />
            <SettingsRow
              label="Gender"
              value={displayGender(profile?.gender)}
              onPress={() => setActiveSheet('personal')}
            />
            <SettingsRow
              label="Age"
              value={profile?.age !== undefined ? String(profile.age) : undefined}
              onPress={() => setActiveSheet('personal')}
            />
          </SettingsSection>

          <SettingsSection title="Body Measurements">
            <SettingsRow
              label="Height"
              value={formatHeight(profile?.height, profile?.heightUnit)}
              onPress={() => setActiveSheet('body')}
            />
            <SettingsRow
              label="Weight"
              value={formatWeight(profile?.weight, profile?.weightUnit)}
              onPress={() => setActiveSheet('body')}
            />
          </SettingsSection>

          <SettingsSection title="Fitness Goal">
            <SettingsRow
              label="Goal"
              value={displayGoal(profile?.fitnessGoal)}
              onPress={() => setActiveSheet('goal')}
            />
          </SettingsSection>

          <View className="items-center pt-8" style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
            <Button variant="secondary" onPress={signOut}>
              Sign Out
            </Button>
          </View>
        </ScrollView>
      )}

      <EditPersonalInfoSheet
        visible={activeSheet === 'personal'}
        onDismiss={() => setActiveSheet(null)}
        currentValues={profile ?? {}}
        onSave={handleSave}
        saving={saveMutation.isPending}
        error={saveMutation.error instanceof Error ? saveMutation.error.message : null}
      />

      <EditBodyMeasurementsSheet
        visible={activeSheet === 'body'}
        onDismiss={() => setActiveSheet(null)}
        currentValues={profile ?? {}}
        onSave={handleSave}
        saving={saveMutation.isPending}
        error={saveMutation.error instanceof Error ? saveMutation.error.message : null}
      />

      <EditFitnessGoalSheet
        visible={activeSheet === 'goal'}
        onDismiss={() => setActiveSheet(null)}
        currentGoal={profile?.fitnessGoal}
        onSave={handleSave}
        saving={saveMutation.isPending}
        error={saveMutation.error instanceof Error ? saveMutation.error.message : null}
      />
    </View>
  )
}

export default SettingsScreen
