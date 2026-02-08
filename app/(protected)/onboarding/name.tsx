import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { useProfileForm } from '@/contexts/profile-form-context'
import { useZodForm } from '@/hooks/use-zod-form'
import { useRouter } from 'expo-router'
import { FormProvider } from 'react-hook-form'
import { Keyboard, Platform, Pressable, Text, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

const nameSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
})

export default function NameScreen() {
  const router = useRouter()
  const { updateField } = useProfileForm()
  const insets = useSafeAreaInsets()

  const form = useZodForm({
    schema: nameSchema,
    defaultValues: { fullName: '' },
  })

  const onContinue = (data: z.infer<typeof nameSchema>) => {
    updateField('fullName', data.fullName)
    router.push('/(protected)/onboarding/demographics')
  }

  const onSkip = () => {
    router.push('/(protected)/onboarding/demographics')
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top + 30}
      className="flex-1"
    >
      <Pressable className="flex-1" onPress={Keyboard.dismiss}>
        <View className="flex-1 px-6 pt-8">
          <Text className="text-2xl font-inter-bold text-content-primary mb-2">What&apos;s your name?</Text>
          <Text className="text-base font-inter text-content-secondary mb-8">
            This helps us personalize your experience.
          </Text>

          <FormProvider {...form}>
            <FormInput
              name="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
            />
          </FormProvider>

          <View className="mt-auto gap-3" style={{ paddingBottom: Math.max(insets.bottom, 32) }}>
            <Button onPress={form.handleSubmit(onContinue)}>Continue</Button>
            <Button variant="ghost" onPress={onSkip}>
              Skip
            </Button>
          </View>
        </View>
      </Pressable>
    </KeyboardAvoidingView>
  )
}
