import { useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { Button, H1, Input, Paragraph, XStack, YStack, Separator } from 'tamagui'
import { useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { useSignUpMutation } from '../library/hooks/query-hooks'
import GoogleAuth from '../components/google-auth.native'
import { authService } from '../services/auth.service'
import { User, Session } from '@supabase/supabase-js'

export default function RegisterScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const router = useRouter()
  const toast = useToastController()

  // Use the sign up mutation hook from React Query
  const { mutate: signUpMutation, isPending: loading } = useSignUpMutation()

  const handleGoogleAuthSuccess = async (user: User, session: Session | null) => {
    try {
      // Sync user data with Supabase profile and update local state
      await authService.syncUserProfile(user, session)
      // Show success message
      toast.show('Registration successful', {
        message: 'Successfully signed in with Google',
        type: 'success',
      })
      // Redirect to home page after successful login
      router.replace('/')
    } catch (error: any) {
      toast.show('Registration Error', {
        message: error.message || 'Failed to sign in with Google',
        type: 'error',
      })
    }
  }

  const handleGoogleAuthError = (error: Error) => {
    toast.show('Google Sign-In Failed', {
      message: error.message || 'Failed to sign in with Google',
      type: 'error',
    })
  }

  const handleRegister = () => {
    // Use the mutation from React Query
    signUpMutation(
      { email, password },
      {
        onSuccess: () => {
          toast.show('Registration successful', {
            message: 'Please check your email to verify your account',
            type: 'success',
          })

          // Navigate to login screen
          router.push('/login')
        },
        onError: (error: Error) => {
          toast.show('Registration failed', {
            message: error.message || 'An unexpected error occurred',
            type: 'error',
          })
        },
      }
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <YStack flex={1} p="$4" space="$4" justify="center">
        <YStack space="$2" mb="$4">
          <H1 text="center">Create Account</H1>
          <Paragraph text="center">Sign up for a new account</Paragraph>
        </YStack>

        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <Input
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Button theme="blue" size="$4" mt="$2" onPress={handleRegister} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>

        <XStack my="$4">
          <YStack flex={1}>
            <Separator />
          </YStack>
          <Paragraph px="$2" color="gray">
            or
          </Paragraph>
          <YStack flex={1}>
            <Separator />
          </YStack>
        </XStack>

        <YStack>
          <GoogleAuth onAuthSuccess={handleGoogleAuthSuccess} onAuthError={handleGoogleAuthError} />
        </YStack>

        <XStack justify="center" space="$2" mt="$4">
          <Paragraph>Already have an account?</Paragraph>
          <Paragraph color="$blue10" fontWeight="bold" onPress={() => router.push('/login')}>
            Sign In
          </Paragraph>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
