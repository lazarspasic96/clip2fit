import { Button } from '@/components/ui/button'
import { AuthDivider } from '@/components/auth/auth-divider'
import { GoogleSignInButton } from '@/components/auth/google-sign-in-button'
import { FormInput } from '@/components/ui/form-input'
import { Logo } from '@/components/ui/logo'
import { useAuth } from '@/contexts/auth-context'
import { useZodForm } from '@/hooks/use-zod-form'
import { Image } from 'expo-image'
import { Link } from 'expo-router'
import { useState } from 'react'
import { FormProvider } from 'react-hook-form'
import { Alert, Keyboard, Platform, Pressable, Text, View } from 'react-native'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const LoginScreen = () => {
  const { signIn, signInWithGoogle, loading } = useAuth()
  const [authError, setAuthError] = useState<string | null>(null)
  const insets = useSafeAreaInsets()

  const form = useZodForm({
    schema: loginSchema,
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setAuthError(null)
    const result = await signIn(data)
    if (!result.success) {
      setAuthError(result.error ?? 'Sign in failed')
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
    <View className="flex-1 bg-background-primary">
      <Image
        source={require('@/assets/images/auth-bg-pattern.png')}
        contentFit="cover"
        className="absolute inset-0 w-full h-full"
      />
      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={insets.top}
          className="flex-1"
        >
          <Pressable className="flex-1" onPress={Keyboard.dismiss}>
            <View className="flex-1 justify-center px-6">
              <Logo size="md" className="mb-1" />
              <Text className="text-2xl font-inter-bold text-content-primary mb-8">Welcome back</Text>

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
                    placeholder="Enter your password"
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="password"
                  />

                  <Pressable
                    onPress={() => Alert.alert('Coming soon', 'Password reset will be available in a future update.')}
                    className="self-end"
                  >
                    <Text className="text-sm font-inter text-brand-accent">Forgot password?</Text>
                  </Pressable>

                  {authError && <Text className="text-sm font-inter text-content-badge-error">{authError}</Text>}

                  <Button onPress={form.handleSubmit(onSubmit)} loading={loading}>
                    Sign In
                  </Button>
                </View>
              </FormProvider>

              <AuthDivider />
              <GoogleSignInButton onPress={onGoogleSignIn} loading={loading} />

              <View className="flex-row justify-center mt-6">
                <Text className="text-sm font-inter text-content-secondary">Don&apos;t have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                  <Text className="text-sm font-inter-semibold text-brand-accent">Sign up</Text>
                </Link>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </View>
    </View>
  )
}

export default LoginScreen
