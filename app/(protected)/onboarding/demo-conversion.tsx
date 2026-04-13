import { Button } from '@/components/ui/button'
import { TikTokIcon, InstagramIcon, YouTubeIcon } from '@/components/ui/platform-icons'
import { HeroProgressRing } from '@/components/processing/hero-progress-ring'
import { getStageSubtitle, useConversion } from '@/contexts/conversion-context'
import { useProfileForm } from '@/contexts/profile-form-context'
import { Colors } from '@/constants/colors'
import { setReachedPaywall } from '@/utils/onboarding-storage'
import * as Clipboard from 'expo-clipboard'
import { useRouter } from 'expo-router'
import { AlertCircle, ClipboardPaste, Sparkles } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const SAMPLE_VIDEO_MALE = 'https://www.tiktok.com/@jeffnippardfitness/video/7445679252759923973'
const SAMPLE_VIDEO_FEMALE = 'https://www.tiktok.com/@anisiafromsprouts/video/7340460322299563310'

const DemoConversionScreen = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { state, startConversion, clear } = useConversion()
  const { getData } = useProfileForm()
  const [url, setUrl] = useState('')
  const navigatedRef = useRef(false)

  const isProcessing = state.jobState === 'processing'
  const isCompleted = state.jobState === 'completed' || state.jobState === 'existing'
  const isError = state.jobState === 'error'
  const completedWorkoutId = state.workoutId

  // On completion, wait briefly then navigate to paywall
  useEffect(() => {
    if (!isCompleted || navigatedRef.current) return
    navigatedRef.current = true

    const timer = setTimeout(() => {
      clear()
      setReachedPaywall()
      const route = completedWorkoutId !== null
        ? `/(protected)/onboarding/paywall?workoutId=${completedWorkoutId}`
        : '/(protected)/onboarding/paywall'
      router.push(route as never)
    }, 1500)

    return () => clearTimeout(timer)
  }, [isCompleted, completedWorkoutId, clear, router])

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync()
    if (text.length > 0) {
      setUrl(text)
    }
  }

  const handleConvert = () => {
    if (url.trim().length === 0) return
    startConversion(url.trim())
  }

  const handleSample = () => {
    const gender = getData().gender
    const sampleUrl = gender === 'female' ? SAMPLE_VIDEO_FEMALE : SAMPLE_VIDEO_MALE
    setUrl(sampleUrl)
    startConversion(sampleUrl)
  }

  const handleSkip = () => {
    clear()
    setReachedPaywall()
    router.push('/(protected)/onboarding/paywall')
  }

  const handleRetry = () => {
    clear()
  }

  return (
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top }}>
      {/* Processing glow */}
      {isProcessing && (
        <Animated.View
          entering={FadeIn.duration(400)}
          exiting={FadeOut.duration(300)}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 360,
            zIndex: 0,
            experimental_backgroundImage:
              'radial-gradient(circle at 50% 40%, rgba(132,204,22,0.06) 0%, transparent 60%)',
          }}
        />
      )}

      {/* Idle / Error — show input */}
      {!isProcessing && !isCompleted && (
        <Animated.View entering={FadeIn.duration(300)} className="flex-1 justify-center px-6">
          <Text
            style={{ fontFamily: 'Onest_400Regular', fontSize: 26, fontWeight: '700', lineHeight: 31, letterSpacing: -0.3 }}
            className="text-content-primary mb-2"
          >
            Try your first{'\n'}
            <Text style={{ color: Colors.brand.logo }}>conversion</Text>
          </Text>
          <Text className="text-[15px] font-inter text-content-secondary leading-[22px] mb-6">
            Paste a workout video URL or try a sample to see how it works.
          </Text>

          {/* Error message */}
          {isError && state.error !== null && (
            <Pressable onPress={handleRetry}>
              <View className="flex-row items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-4">
                <AlertCircle size={20} color={Colors.badge.error.content} pointerEvents="none" />
                <Text className="flex-1 text-sm font-inter text-red-400">
                  {state.error}. Tap to retry.
                </Text>
              </View>
            </Pressable>
          )}

          {/* URL input */}
          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 flex-row items-center bg-background-secondary rounded-xl px-4 border border-border-primary">
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://www.tiktok.com/..."
                placeholderTextColor={Colors.content.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="go"
                onSubmitEditing={handleConvert}
                className="flex-1 text-base font-inter text-content-primary py-4"
              />
            </View>
            <Pressable
              onPress={handlePaste}
              className="items-center justify-center bg-background-secondary rounded-xl border border-border-primary w-[52px] h-[52px]"
              hitSlop={8}
            >
              <ClipboardPaste size={22} color={Colors.content.secondary} pointerEvents="none" />
            </Pressable>
          </View>

          {/* Supported platforms */}
          <View className="flex-row items-center gap-3 mb-8">
            <Text className="text-sm font-inter text-content-tertiary">Supported:</Text>
            <TikTokIcon size={18} />
            <InstagramIcon size={18} />
            <YouTubeIcon size={18} />
          </View>

          <Button onPress={handleConvert} disabled={url.trim().length === 0}>
            Convert
          </Button>

          {/* Sample video option */}
          <View className="mt-6 items-center">
            <Text className="text-sm font-inter text-content-tertiary mb-3">
              {"Don't"} have a video handy?
            </Text>
            <Pressable
              onPress={handleSample}
              className="flex-row items-center gap-2 bg-background-secondary border border-border-primary rounded-2xl px-5 py-3"
            >
              <Sparkles size={16} color={Colors.brand.logo} pointerEvents="none" />
              <Text className="text-sm font-inter-medium text-content-primary">
                Try with a sample video
              </Text>
            </Pressable>
          </View>

        </Animated.View>
      )}

      {/* Skip — pinned to bottom, visible only in idle/error state */}
      {!isProcessing && !isCompleted && (
        <Pressable onPress={handleSkip} className="px-6 mb-2 py-3" style={{ paddingBottom: insets.bottom + 8 }}>
          <Text className="text-[13px] font-inter text-content-tertiary text-center">
            Skip for now
          </Text>
        </Pressable>
      )}

      {/* Processing state */}
      {isProcessing && (
        <Animated.View entering={FadeIn.duration(300)} className="flex-1 items-center pt-16">
          <HeroProgressRing
            targetProgress={state.progress}
            platform={state.platform}
            stage={state.stage}
          />

          <View className="mt-14 items-center px-6" style={{ minHeight: 56 }}>
            <Animated.View
              key={state.stage}
              entering={FadeIn.duration(300)}
              exiting={FadeOut.duration(200)}
              className="items-center gap-1"
            >
              <Text className="text-lg font-inter-semibold text-content-primary text-center">
                {state.message}
              </Text>
              <Text className="text-sm font-inter text-content-tertiary text-center">
                {getStageSubtitle(state.stage)}
              </Text>
            </Animated.View>
          </View>

          <Text
            numberOfLines={1}
            className="text-[13px] font-inter text-content-tertiary text-center mt-4 px-6"
          >
            {state.sourceUrl.length > 40 ? `${state.sourceUrl.slice(0, 40)}...` : state.sourceUrl}
          </Text>
        </Animated.View>
      )}

      {/* Completed state */}
      {isCompleted && (
        <Animated.View entering={FadeIn.duration(400)} className="flex-1 items-center justify-center px-6">
          <View className="items-center gap-3">
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: 'rgba(132, 204, 22, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 28 }}>✓</Text>
            </View>
            <Text className="text-xl font-inter-bold text-content-primary text-center">
              Workout converted!
            </Text>
            <Text className="text-sm font-inter text-content-secondary text-center">
              {state.jobState === 'existing' ? 'This one was already in your library.' : 'Your first workout is ready.'}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  )
}

export default DemoConversionScreen
