import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { FormRadioGroup } from '@/components/ui/form-radio-group'
import { FormSegmentedControl } from '@/components/ui/form-segmented-control'
import { Label } from '@/components/ui/label'
import { useProfileForm } from '@/contexts/profile-form-context'
import { useZodForm } from '@/hooks/use-zod-form'
import type { Gender, HeightUnit, WeightUnit } from '@/types/profile'
import { GENDERS } from '@/types/profile'
import { useRouter } from 'expo-router'
import { FormProvider } from 'react-hook-form'
import { Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

const userInfoSchema = z.object({
  fullName: z.string().optional().default(''),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  age: z.string().optional().default(''),
  height: z.string().optional().default(''),
  heightUnit: z.enum(['cm', 'ft']).default('cm'),
  weight: z.string().optional().default(''),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
})

type UserInfoValues = z.infer<typeof userInfoSchema>

const DemographicsScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const insets = useSafeAreaInsets()

  const form = useZodForm({
    schema: userInfoSchema,
    defaultValues: {
      fullName: '',
      gender: undefined,
      age: '',
      height: '',
      heightUnit: 'cm' as HeightUnit,
      weight: '',
      weightUnit: 'kg' as WeightUnit,
    },
  })

  const heightUnit = form.watch('heightUnit') as HeightUnit
  const weightUnit = form.watch('weightUnit') as WeightUnit

  const onNext = (data: UserInfoValues) => {
    if (data.fullName) updateField('fullName', data.fullName)
    if (data.gender) updateField('gender', data.gender as Gender)
    if (data.age) updateField('age', parseInt(data.age, 10))
    if (data.height) {
      updateField('height', parseFloat(data.height))
      updateField('heightUnit', data.heightUnit as HeightUnit)
    }
    if (data.weight) {
      updateField('weight', parseFloat(data.weight))
      updateField('weightUnit', data.weightUnit as WeightUnit)
    }
    router.push('/(protected)/onboarding/goal')
  }

  return (
    <FormProvider {...form}>
      <View className="flex-1 bg-background-primary">
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <Text className="text-2xl font-inter-bold text-content-primary mb-8">Tell us about yourself</Text>

          <View className="gap-6">
            <FormInput
              name="fullName"
              label="Your name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
            />

            <FormRadioGroup name="gender" label="Gender" options={GENDERS} />

            <FormInput name="age" label="Age" placeholder="e.g. 25" keyboardType="number-pad" />

            <View className="gap-1.5">
              <Label text="Height" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    name="height"
                    placeholder={heightUnit === 'cm' ? 'e.g. 175' : "e.g. 5'10"}
                    keyboardType="decimal-pad"
                    showError={false}
                  />
                </View>
                <View className="w-28">
                  <FormSegmentedControl
                    name="heightUnit"
                    options={[
                      { label: 'cm', value: 'cm' },
                      { label: 'ft', value: 'ft' },
                    ]}
                  />
                </View>
              </View>
            </View>

            <View className="gap-1.5">
              <Label text="Weight" />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormInput
                    name="weight"
                    placeholder={weightUnit === 'kg' ? 'e.g. 70' : 'e.g. 154'}
                    keyboardType="decimal-pad"
                    showError={false}
                  />
                </View>
                <View className="w-28">
                  <FormSegmentedControl
                    name="weightUnit"
                    options={[
                      { label: 'kg', value: 'kg' },
                      { label: 'lbs', value: 'lbs' },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        <View className="px-6 mb-6 gap-3" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
          <Button onPress={form.handleSubmit(onNext)}>Next</Button>
        </View>
      </View>
    </FormProvider>
  )
}

export default DemographicsScreen
