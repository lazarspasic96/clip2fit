import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Button } from '@/components/ui/button'

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
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)', '#000000']}
        locations={[0.3, 0.65, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View className="flex-1 justify-end px-4" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Animated.View
          className="absolute left-4"
          style={{ top: insets.top + 16 }}
          entering={FadeInDown.delay(200).springify()}
        >
          <Text className="text-xl font-inter-medium text-brand-logo">Clip2Fit</Text>
        </Animated.View>

        <Animated.View className="mb-6" entering={FadeInDown.delay(400).springify()}>
          <Text className="text-4xl font-inter-bold text-content-primary leading-[40px]">
            Grab Workouts{'\n'}From <Text className="text-brand-accent">Anywhere</Text>
          </Text>
          <Text className="text-lg font-inter text-content-secondary mt-4">
            Grab gym routines from TikTok, Instagram, and YouTube. Follow influencer workouts or create your own. No
            more excuses.
          </Text>
        </Animated.View>

        <Animated.View className="flex-row gap-4 pb-10" entering={FadeInDown.delay(600).springify()}>
          <Button onPress={() => router.push('/(auth)/signup')} className="flex-1 shadow-ring rounded-3xl">
            Sign up Free
          </Button>
          <Button
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
            className="flex-1 shadow-ring rounded-3xl"
          >
            Log in
          </Button>
        </Animated.View>
      </View>
    </View>
  )
}

export default WelcomeScreen
