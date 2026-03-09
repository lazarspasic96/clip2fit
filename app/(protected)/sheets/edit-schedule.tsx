import { Colors } from '@/constants/colors'
import { useRouter } from 'expo-router'
import { Clock, Zap } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated'

import { SelectionCard } from '@/components/onboarding/selection-card'
import { Button } from '@/components/ui/button'
import { SectionDivider } from '@/components/ui/section-divider'
import { SheetTitle } from '@/components/ui/sheet-title'
import { useSaveProfileMutation } from '@/hooks/use-api'
import { useProfileQuery } from '@/hooks/use-profile-query'
import { SESSION_DURATIONS } from '@/types/profile'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const ROW_1 = [1, 2, 3, 4] as const
const ROW_2 = [5, 6, 7] as const

const NumberButton = ({ num, selected, onPress }: { num: number; selected: boolean; onPress: () => void }) => {
  const opacity = useSharedValue(1)
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const handlePress = () => {
    opacity.value = withSequence(withTiming(0.7, { duration: 100 }), withTiming(1, { duration: 100 }))
    onPress()
  }

  return (
    <AnimatedPressable
      onPress={handlePress}
      className={`flex-1 items-center justify-center rounded-2xl border py-4 ${
        selected ? 'bg-brand-accent border-brand-accent' : 'bg-background-secondary border-border-primary'
      }`}
      style={[animatedStyle, { borderCurve: 'continuous' as const }]}
    >
      <Text
        className="text-2xl font-inter-bold"
        style={{ color: selected ? Colors.content.buttonPrimary : Colors.content.primary }}
      >
        {num}
      </Text>
      <Text
        className="text-xs font-inter mt-0.5"
        style={{ color: selected ? Colors.content.buttonPrimary : Colors.content.tertiary }}
      >
        {num === 1 ? 'day' : 'days'}
      </Text>
    </AnimatedPressable>
  )
}

const EditScheduleScreen = () => {
  const router = useRouter()
  const { profile } = useProfileQuery()
  const saveMutation = useSaveProfileMutation()

  const [frequency, setFrequency] = useState<number | undefined>(profile?.trainingFrequency)
  const [duration, setDuration] = useState<number | undefined>(profile?.sessionDuration)

  const saving = saveMutation.isPending
  const apiError = saveMutation.error instanceof Error ? saveMutation.error.message : null

  const handleSave = () => {
    const freqChanged = frequency !== profile?.trainingFrequency
    const durChanged = duration !== profile?.sessionDuration
    if (!freqChanged && !durChanged) {
      router.back()
      return
    }
    const diff: Record<string, unknown> = {}
    if (freqChanged) diff.trainingFrequency = frequency
    if (durChanged) diff.sessionDuration = duration
    saveMutation.mutate(diff, { onSuccess: () => router.back() })
  }

  return (
    <View className="px-6 pt-4 pb-8">
      <SheetTitle>Schedule</SheetTitle>

      <Text className="text-sm font-inter-medium text-content-secondary mb-3">Days per week</Text>
      <View className="gap-3">
        <View className="flex-row gap-3">
          {ROW_1.map((num) => (
            <NumberButton key={num} num={num} selected={frequency === num} onPress={() => setFrequency(num)} />
          ))}
        </View>
        <View className="flex-row gap-3 px-8">
          {ROW_2.map((num) => (
            <NumberButton key={num} num={num} selected={frequency === num} onPress={() => setFrequency(num)} />
          ))}
        </View>
      </View>

      <View className="my-5">
        <SectionDivider />
      </View>

      <Text className="text-sm font-inter-medium text-content-secondary mb-3">Session duration</Text>
      <View className="gap-3">
        {SESSION_DURATIONS.map((option) => (
          <SelectionCard
            key={option.value}
            icon={option.value === 15 ? Zap : Clock}
            title={option.label}
            subtitle={option.subtitle}
            selected={duration === option.value}
            onPress={() => setDuration(option.value)}
          />
        ))}
      </View>

      {apiError !== null && <Text className="text-sm font-inter text-red-400 mt-3">{apiError}</Text>}

      <Button onPress={handleSave} loading={saving} className="mt-6">Save</Button>
    </View>
  )
}

export default EditScheduleScreen
