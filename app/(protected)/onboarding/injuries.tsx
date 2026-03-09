import { ChipGrid } from '@/components/onboarding/chip-grid'
import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { Colors } from '@/constants/colors'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { InjuryTag } from '@/types/profile'
import { INJURY_TAGS } from '@/types/profile'
import { Info } from 'lucide-react-native'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

const EXCLUSIVE_VALUES = ['none']

const InjuriesScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const [selected, setSelected] = useState<InjuryTag[]>([])
  const [notes, setNotes] = useState('')
  const [showInfo, setShowInfo] = useState(true)

  const handleToggle = (value: string) => {
    const tag = value as InjuryTag
    setSelected((prev) => {
      if (EXCLUSIVE_VALUES.includes(tag)) {
        return prev.includes(tag) ? [] : [tag]
      }
      const withoutExclusive = prev.filter((v) => !EXCLUSIVE_VALUES.includes(v))
      return withoutExclusive.includes(tag)
        ? withoutExclusive.filter((v) => v !== tag)
        : [...withoutExclusive, tag]
    })
  }

  const handleNext = () => {
    // Don't save "none" to API — it's just a UI convenience
    const toSave = selected.filter((v) => v !== 'none')
    if (toSave.length > 0) updateField('injuries', toSave as InjuryTag[])
    if (notes.trim().length > 0) updateField('injuryNotes', notes.trim())
    router.push('/(protected)/onboarding/activity-level')
  }

  const handleSkip = () => {
    router.push('/(protected)/onboarding/activity-level')
  }

  return (
    <OnboardingScreen
      title="Anything we should keep in mind?"
      onNext={handleNext}
      onBack={() => router.back()}
      onSkip={handleSkip}
      keyboardAware
      nextDisabled={selected.length === 0 && notes.trim().length === 0}
    >
      <View className="flex-row items-center gap-2 mb-4">
        <Pressable onPress={() => setShowInfo((prev) => !prev)} hitSlop={8}>
          <Info size={18} color={Colors.content.tertiary} pointerEvents="none" />
        </Pressable>
        {showInfo && (
          <View className="flex-1">
            <Text className="text-xs font-inter text-content-tertiary">
              We use this to avoid exercises that could cause pain or re-injury.
            </Text>
          </View>
        )}
      </View>

      <ChipGrid
        options={INJURY_TAGS}
        selected={selected}
        onToggle={handleToggle}
        exclusive={EXCLUSIVE_VALUES}
        columns={2}
      />

      <View className="mt-6">
        <Text className="text-sm font-inter-medium text-content-secondary mb-2">
          Anything else? (optional)
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="E.g., recovering from shoulder surgery..."
          placeholderTextColor={Colors.content.tertiary}
          maxLength={200}
          multiline
          numberOfLines={3}
          className="bg-background-secondary border border-border-primary rounded-xl px-4 py-3 text-content-primary text-sm font-inter"
          style={{ minHeight: 80, textAlignVertical: 'top', borderCurve: 'continuous' }}
        />
      </View>
    </OnboardingScreen>
  )
}

export default InjuriesScreen
