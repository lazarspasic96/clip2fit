import { useState } from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { Button, H1, Input, Paragraph, XStack, YStack, Separator } from 'tamagui'
import { useRouter } from 'expo-router'
import { useToastController } from '@tamagui/toast'
import { useSignInMutation } from '../library/hooks/query-hooks'
import GoogleAuth from '../components/google-auth.native'
import { authService } from '../services/auth.service'
import { User, Session } from '@supabase/supabase-js'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const toast = useToastController()

  const { mutate: signInMutation, isPending: loading } = useSignInMutation()

  const handleGoogleAuthSuccess = async (user: User, session: Session | null) => {
    try {
      // Sync user data with Supabase profile and update local state
      await authService.syncUserProfile(user, session)
      // Redirect to home page after successful login
      router.replace('/')
    } catch (error: any) {
      toast.show('Sign-In Error', {
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

  const handleLogin = () => {
    signInMutation(
      { email, password },
      {
        onSuccess: () => {
          router.replace('/')
        },
        onError: (error: Error) => {
          toast.show('Login failed', {
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
      <YStack flex={1} p="$4" gap="$4" justify="center">
        <YStack gap="$2" mb="$4">
          <H1 text="center">Welcome Back</H1>
          <Paragraph text="center">Sign in to your account</Paragraph>
        </YStack>

        <Input
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <Input placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

        <Button theme="blue" size="$4" mt="$2" onPress={handleLogin} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
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

        <XStack width="100%">
          <GoogleAuth onAuthSuccess={handleGoogleAuthSuccess} onAuthError={handleGoogleAuthError} />
        </XStack>

        <XStack justify="center" space="$2" mt="$4">
          <Paragraph>Don&apos;t have an account?</Paragraph>
          <Paragraph color="$blue10" fontWeight="bold" onPress={() => router.push('/register')}>
            Sign Up
          </Paragraph>
        </XStack>
      </YStack>
    </KeyboardAvoidingView>
  )
}
