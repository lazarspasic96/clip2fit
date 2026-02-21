import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { Onest_400Regular } from '@expo-google-fonts/onest'
import { DarkTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack, useRouter, useSegments } from 'expo-router'
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent'
import * as SplashScreen from 'expo-splash-screen'
import * as SystemUI from 'expo-system-ui'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import 'react-native-reanimated'
import '../global.css'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { ConversionProvider } from '@/contexts/conversion-context'
import { AppQueryClientProvider } from '@/contexts/query-client'
import { FloatingConversionPill } from '@/components/processing/floating-conversion-pill'

SplashScreen.preventAutoHideAsync()
SystemUI.setBackgroundColorAsync('#09090b')

const AppDarkTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: '#09090b', card: '#09090b' },
}

export const unstable_settings = {
  anchor: '(protected)',
}

const RootNavigator = () => {
  const { session, initialized, onboardingComplete } = useAuth()
  const { hasShareIntent } = useShareIntentContext()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    console.log('[RootNav] auth effect — initialized:', initialized, 'session:', !!session, 'onboardingComplete:', onboardingComplete, 'hasShareIntent:', hasShareIntent, 'segments:', segments)
    if (!initialized) return

    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments.includes('onboarding' as never)
    const inProcessUrl = segments.includes('process-url' as never)

    if (!session && !inAuthGroup) {
      console.log('[RootNav] → redirect to welcome (no session)')
      router.replace('/(auth)/welcome')
      return
    }

    if (session && !onboardingComplete && !inOnboarding) {
      console.log('[RootNav] → redirect to onboarding')
      router.replace('/(protected)/onboarding/demographics')
      return
    }

    if (session && onboardingComplete && inAuthGroup) {
      console.log('[RootNav] → redirect to home (in auth group but authenticated)')
      router.replace('/(protected)/(tabs)/(home)' as never)
      return
    }

    if (session && onboardingComplete && hasShareIntent && !inProcessUrl) {
      console.log('[RootNav] → redirect to process-url (share intent detected)')
      router.replace('/(protected)/process-url' as never)
    }
  }, [initialized, session, onboardingComplete, segments, hasShareIntent])

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
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#09090b' }}>
      <AppQueryClientProvider>
        <ShareIntentProvider
          options={{
            debug: __DEV__,
            resetOnBackground: true,
            onResetShareIntent: () => {},
          }}
        >
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <AuthProvider>
                <ConversionProvider>
                  <RootNavigator />
                  <FloatingConversionPill />
                </ConversionProvider>
              </AuthProvider>
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </ShareIntentProvider>
      </AppQueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
