import { OnboardingScreen } from '@/components/onboarding/onboarding-screen'
import { FormInput } from '@/components/ui/form-input'
import { FormRadioGroup } from '@/components/ui/form-radio-group'
import { FormSegmentedControl } from '@/components/ui/form-segmented-control'
import { Label } from '@/components/ui/label'
import { DateOfBirthPicker } from '@/components/ui/native-ui/date-of-birth-picker'
import { useCompleteOnboarding } from '@/hooks/use-complete-onboarding'
import { useProfileForm } from '@/contexts/profile-form-context'
import { useZodForm } from '@/hooks/use-zod-form'
import type { Gender, HeightUnit, WeightUnit } from '@/types/profile'
import { GENDERS } from '@/types/profile'
import type { DobIsoDate } from '@/utils/dob-date'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { View } from 'react-native'
import { z } from 'zod'

const aboutYouSchema = z.object({
  fullName: z.string().optional().default(''),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  height: z.string().optional().default(''),
  heightUnit: z.enum(['cm', 'ft']).default('cm'),
  weight: z.string().optional().default(''),
  weightUnit: z.enum(['kg', 'lbs']).default('kg'),
})

type AboutYouValues = z.infer<typeof aboutYouSchema>

const AboutYouScreen = () => {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const { complete, loading } = useCompleteOnboarding()
  const [dateOfBirth, setDateOfBirth] = useState<DobIsoDate | undefined>()
  const form = useZodForm({
    schema: aboutYouSchema,
    defaultValues: {
      fullName: '',
      gender: undefined,
      height: '',
      heightUnit: 'cm' as HeightUnit,
      weight: '',
      weightUnit: 'kg' as WeightUnit,
    },
  })

  const heightUnit = form.watch('heightUnit') as HeightUnit
  const weightUnit = form.watch('weightUnit') as WeightUnit

  const handleComplete = async (data: AboutYouValues) => {
    if (data.fullName) updateField('fullName', data.fullName)
    if (data.gender) updateField('gender', data.gender as Gender)
    if (dateOfBirth !== undefined) updateField('dateOfBirth', dateOfBirth)
    if (data.height) {
      updateField('height', parseFloat(data.height))
      updateField('heightUnit', data.heightUnit as HeightUnit)
    }
    if (data.weight) {
      updateField('weight', parseFloat(data.weight))
      updateField('weightUnit', data.weightUnit as WeightUnit)
    }
    await complete()
  }

  return (
    <FormProvider {...form}>
      <OnboardingScreen
        title="One last thing — tell us about yourself"
        subtitle="All fields are optional."
        onNext={form.handleSubmit(handleComplete)}
        onBack={() => router.back()}
        nextLabel="Complete"
        loading={loading}
        keyboardAware
      >
        <View className="gap-6">
          <FormInput
            name="fullName"
            label="Your name"
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
          />

          <FormRadioGroup name="gender" label="Gender" options={GENDERS} />

          <DateOfBirthPicker value={dateOfBirth} onChange={setDateOfBirth} />

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
      </OnboardingScreen>
    </FormProvider>
  )
}

export default AboutYouScreen
