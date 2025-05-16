import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin'
import { useState } from 'react'
import { Alert, ActivityIndicator, View, Platform } from 'react-native'
import { supabase } from '../library/utils/supabase'
import { User, Session } from '@supabase/supabase-js'

const ANDROID_CLIENT_ID = '394113945262-3gmh9f446bdu5q2g0e6m8mtghdofarva.apps.googleusercontent.com'
const IOS_CLIENT_ID = '394113945262-6b8geti89qkt8k2s28avdhmf4fkllknk.apps.googleusercontent.com'

type GoogleAuthProps = {
  onAuthSuccess?: (user: User, session: Session | null) => void
  onAuthError?: (error: Error) => void
}

export default function GoogleAuth({ onAuthSuccess, onAuthError }: GoogleAuthProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Configure Google Sign-In
  GoogleSignin.configure({
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    webClientId: Platform.OS === 'ios' ? IOS_CLIENT_ID : ANDROID_CLIENT_ID,
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Check if Play Services are available
      await GoogleSignin.hasPlayServices()

      // Sign in with Google first to get user info
      await GoogleSignin.signIn()

      // Get tokens
      const { idToken } = await GoogleSignin.getTokens()

      if (idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        })

        if (error) {
          throw error
        }

        // If successful login and we have user data
        if (data.user) {
          // Call the success callback with user and session
          if (onAuthSuccess) {
            onAuthSuccess(data.user, data.session)
          }
        }
      } else {
        throw new Error('No ID token present in Google sign-in response')
      }
    } catch (error: any) {
      let errorMessage = 'An unexpected error occurred'

      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        errorMessage = 'Sign in was cancelled'
      } else if (error.code === statusCodes.IN_PROGRESS) {
        errorMessage = 'Sign in is already in progress'
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        errorMessage = 'Play services not available or outdated'
      } else if (error.message) {
        errorMessage = error.message
      }

      console.error('Google sign-in error:', error)

      // Call the error callback if provided
      if (onAuthError) {
        onAuthError(error)
      } else {
        // Default error handling if no callback provided
        Alert.alert('Sign-in Error', errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={{ width: '100%' }}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
          style={{ width: '100%' }}
        />
      )}
    </View>
  )
}
