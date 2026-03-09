import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { Onest_400Regular } from '@expo-google-fonts/onest'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack, useRouter, useSegments } from 'expo-router'
import { useIncomingShare } from 'expo-sharing'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import 'react-native-reanimated'
import '../global.css'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { ConversionProvider, useConversion } from '@/contexts/conversion-context'
import { AppQueryClientProvider } from '@/contexts/query-client'
import { FloatingConversionPill } from '@/components/processing/floating-conversion-pill'
import { Colors } from '@/constants/colors'

SplashScreen.preventAutoHideAsync()
SystemUI.setBackgroundColorAsync(Colors.background.primary)

const AppDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.background.primary, card: Colors.background.primary },
}

export const unstable_settings = {
  anchor: '(protected)',
}

const ShareIntentHandler = () => {
  const { session, onboardingComplete } = useAuth()
  const { state, startConversion } = useConversion()
  const { sharedPayloads, clearSharedPayloads } = useIncomingShare()

  useEffect(() => {
    if (
      session !== null &&
      onboardingComplete &&
      sharedPayloads.length > 0 &&
      state.jobState === 'idle'
    ) {
      const firstPayload = sharedPayloads[0]
      const sharedUrl = firstPayload?.value
      if (sharedUrl !== undefined && sharedUrl !== null) {
        startConversion(sharedUrl)
        clearSharedPayloads()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to new shared payloads
  }, [sharedPayloads, session, onboardingComplete])

  return null
}

const RootNavigator = () => {
  const { session, initialized, onboardingComplete } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!initialized) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments.includes('onboarding' as never)

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/welcome')
      return
    }

    if (session && !onboardingComplete && !inOnboarding) {
      router.replace('/(protected)/onboarding/goal')
      return
    }

    if (session && onboardingComplete && inAuthGroup) {
      router.replace('/(protected)/(tabs)/(home)' as never)
      return
    }
  }, [initialized, session, onboardingComplete, segments, router])

  if (!initialized) return null

  return (
    <ThemeProvider value={AppDarkTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  )
}

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Onest_400Regular,
  })

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded])

  if (!fontsLoaded) {
    return null
  }

  return (
    <GestureHandlerRootView className="flex-1 bg-background-primary">
      <AppQueryClientProvider>
        <KeyboardProvider>
          <AuthProvider>
            <ConversionProvider>
              <RootNavigator />
              <ShareIntentHandler />
              <FloatingConversionPill />
            </ConversionProvider>
          </AuthProvider>
        </KeyboardProvider>
      </AppQueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
