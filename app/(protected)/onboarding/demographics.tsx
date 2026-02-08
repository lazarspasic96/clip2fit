import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup } from '@/components/ui/radio-group'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { useProfileForm } from '@/contexts/profile-form-context'
import type { Gender, HeightUnit, WeightUnit } from '@/types/profile'
import { GENDERS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function DemographicsScreen() {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const insets = useSafeAreaInsets()

  const [gender, setGender] = useState<Gender | undefined>()
  const [age, setAge] = useState('')
  const [height, setHeight] = useState('')
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('cm')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('kg')

  const onContinue = () => {
    if (gender) updateField('gender', gender)
    if (age) updateField('age', parseInt(age, 10))
    if (height) {
      updateField('height', parseFloat(height))
      updateField('heightUnit', heightUnit)
    }
    if (weight) {
      updateField('weight', parseFloat(weight))
      updateField('weightUnit', weightUnit)
    }
    router.push('/(protected)/onboarding/goal')
  }

  const onSkip = () => {
    router.push('/(protected)/onboarding/goal')
  }

  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 32,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text className="text-2xl font-inter-bold text-content-primary mb-2">About you</Text>
        <Text className="text-base font-inter text-content-secondary mb-8">
          All fields are optional. This helps us tailor recommendations.
        </Text>

        <View className="gap-6">
          <View className="gap-1.5">
            <Label text="Gender" />
            <RadioGroup options={GENDERS} value={gender} onChange={setGender} />
          </View>

          <View className="gap-1.5">
            <Label text="Age" />
            <Input placeholder="e.g. 25" keyboardType="number-pad" value={age} onChangeText={setAge} />
          </View>

          <View className="gap-1.5">
            <Label text="Height" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  placeholder={heightUnit === 'cm' ? 'e.g. 175' : "e.g. 5'10"}
                  keyboardType="decimal-pad"
                  value={height}
                  onChangeText={setHeight}
                />
              </View>
              <View className="w-28">
                <SegmentedControl
                  options={[
                    { label: 'cm', value: 'cm' as HeightUnit },
                    { label: 'ft', value: 'ft' as HeightUnit },
                  ]}
                  value={heightUnit}
                  onChange={setHeightUnit}
                />
              </View>
            </View>
          </View>

          <View className="gap-1.5">
            <Label text="Weight" />
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
              <View className="w-28">
                <SegmentedControl
                  options={[
                    { label: 'kg', value: 'kg' as WeightUnit },
                    { label: 'lbs', value: 'lbs' as WeightUnit },
                  ]}
                  value={weightUnit}
                  onChange={setWeightUnit}
                />
              </View>
            </View>
          </View>
        </View>

        <View className="mt-auto gap-3 pt-8" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Button onPress={onContinue}>Continue</Button>
          <Button variant="ghost" onPress={onSkip}>
            Skip
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </>
  )
}
