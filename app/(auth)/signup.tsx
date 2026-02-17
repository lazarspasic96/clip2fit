import { AuthDivider } from '@/components/auth/auth-divider'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { Button } from '@/components/ui/button'
import { FormInput } from '@/components/ui/form-input'
import { Logo } from '@/components/ui/logo'
import { useAuth } from '@/contexts/auth-context'
import { useZodForm } from '@/hooks/use-zod-form'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Keyboard, Platform, Pressable, Text, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

const signupSchema = z
  .object({
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

const SignupScreen = () => {
  const router = useRouter()
  const { signUp, signInWithGoogle, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const insets = useSafeAreaInsets()

  const form = useZodForm({
    schema: signupSchema,
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: SignupForm) => {
    setAuthError(null)
    const result = await signUp({
      email: data.email,
      password: data.password,
    })
    if (result.success) {
      router.push({
        pathname: '/(auth)/check-email',
        params: { email: data.email },
      })
    } else {
      setAuthError(result.error ?? 'Sign up failed')
    }
  }

  const onGoogleSignIn = async () => {
    setAuthError(null)
    const result = await signInWithGoogle()
    if (!result.success && result.error !== 'Sign in cancelled') {
      setAuthError(result.error ?? 'Google sign in failed')
    }
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
        className="flex-1"
      >
        <Pressable className="flex-1" onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center px-6">
            <Logo size="md" className="mb-1" />
            <Text className="text-2xl font-inter-bold text-content-primary mb-8">Create account</Text>

            <FormProvider {...form}>
              <View className="gap-4">
                <FormInput
                  name="email"
                  label="Email"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <FormInput
                  name="password"
                  label="Password"
                  placeholder="At least 6 characters"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                />

                <FormInput
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter your password"
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                />

                {authError && <Text className="text-sm font-inter text-content-badge-error">{authError}</Text>}

                <Button onPress={form.handleSubmit(onSubmit)} loading={loading}>
                  Sign Up
                </Button>
              </View>
            </FormProvider>

            <AuthDivider />
            <GoogleSignInButton onPress={onGoogleSignIn} loading={loading} />

            <Pressable className="self-center mt-4 p-2" onPress={() => router.push('/(auth)/login')}>
              <Text className="text-sm font-inter text-content-secondary text-center">
                Already have an account? <Text className="font-inter-semibold text-brand-accent">Sign in</Text>
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  )
}

export default SignupScreen
