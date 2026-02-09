import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'

const WelcomeScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  return (
    <View className="flex-1">
      <Image
        source={require('@/assets/images/get-started-img.png')}
        contentFit="cover"
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="flex-1 justify-between px-6 py-10">
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <Logo size="lg" />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text className="text-2xl font-inter-bold text-content-primary mb-3">Convert videos into workouts</Text>
            <Text className="text-base font-inter text-content-secondary">
              Paste a fitness video link and get a structured workout plan in seconds.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(600).springify()}>
            <Button onPress={() => router.push('/(auth)/signup')}>Get Started</Button>

            <Pressable className="mt-4 items-center" onPress={() => router.push('/(auth)/login')}>
              <Text className="text-sm font-inter text-content-secondary">
                Already have an account? <Text className="font-inter-semibold text-brand-accent">Sign in</Text>
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </View>
  )
}

export default WelcomeScreen
