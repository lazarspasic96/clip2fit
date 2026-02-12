import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter'
import { Onest_400Regular } from '@expo-google-fonts/onest'
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Redirect, Stack, useRouter, useSegments } from 'expo-router'
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import 'react-native-reanimated'
import '../global.css'

import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { AppQueryClientProvider } from '@/contexts/query-client'
import { useColorScheme } from '@/hooks/use-color-scheme'

SplashScreen.preventAutoHideAsync()

export const unstable_settings = {
  anchor: '(protected)',
}

const RootNavigator = () => {
  const { session, initialized, onboardingComplete } = useAuth()
  const { hasShareIntent } = useShareIntentContext()
  const segments = useSegments()
  const colorScheme = useColorScheme()

  const inAuthGroup = segments[0] === '(auth)'
  const inOnboarding = segments.includes('onboarding' as never)
  const inProcessUrl = segments.includes('process-url' as never)

  // Redirect based on auth + onboarding state
  if (initialized && !session && !inAuthGroup) {
    return <Redirect href="/(auth)/welcome" />
  }

  if (initialized && session && !onboardingComplete && !inOnboarding) {
    return <Redirect href="/(protected)/onboarding/demographics" />
  }

  if (initialized && session && onboardingComplete && inAuthGroup) {
    return <Redirect href="/(protected)/(tabs)" />
  }

  // Redirect to process-url when a share intent arrives
  if (initialized && session && onboardingComplete && hasShareIntent && !inProcessUrl) {
    return <Redirect href={'/(protected)/process-url' as never} />
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  )
}

const RootLayout = () => {
  const router = useRouter()
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppQueryClientProvider>
        <ShareIntentProvider
          options={{
            debug: __DEV__,
            resetOnBackground: true,
            onResetShareIntent: () => router.replace('/(protected)/(tabs)'),
          }}
        >
          <KeyboardProvider>
            <BottomSheetModalProvider>
              <AuthProvider>
                <RootNavigator />
              </AuthProvider>
            </BottomSheetModalProvider>
          </KeyboardProvider>
        </ShareIntentProvider>
      </AppQueryClientProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
