import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { useAuth } from '@/contexts/auth-context'
import { useCountdown } from '@/hooks/use-countdown'
import { Image } from 'expo-image'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, Mail } from 'lucide-react-native'
import { useState } from 'react'
import { Linking, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const RESEND_COOLDOWN_SECONDS = 30

const CheckEmailScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>()
  const router = useRouter()
  const { resendSignUpEmail, loading } = useAuth()
  const insets = useSafeAreaInsets()
  const [resendError, setResendError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  const { secondsLeft, isActive, start } = useCountdown({
    initialSeconds: RESEND_COOLDOWN_SECONDS,
    autoStart: true,
  })

  const handleOpenEmailApp = async () => {
    await Linking.openURL('mailto:')
  }

  const handleResend = async () => {
    if (isActive || !email) return

    setResendError(null)
    setResendSuccess(false)
    const result = await resendSignUpEmail(email)

    if (result.success) {
      setResendSuccess(true)
      start()
    } else {
      setResendError(result.error ?? 'Failed to resend email')
    }
  }

  const handleGoBack = () => {
    router.back()
  }

  return (
    <View className="flex-1 bg-background-primary">
      <Image
        source={require('@/assets/images/auth-bg-pattern.png')}
        contentFit="cover"
        className="absolute inset-0 w-full h-full"
      />

      <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="px-6 pt-4">
          <Pressable onPress={handleGoBack} hitSlop={8}>
            <ArrowLeft size={24} color="#fafafa" />
          </Pressable>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <Logo size="md" className="mb-6" />

          <View className="w-16 h-16 rounded-full bg-brand-accent/10 items-center justify-center mb-6">
            <Mail size={28} color="#a3e635" strokeWidth={1.5} />
          </View>

          <Text className="text-2xl font-inter-bold text-content-primary mb-2 text-center">
            Check your inbox
          </Text>

          <Text className="text-base font-inter text-content-secondary text-center mb-10 px-4">
            We{`'`}ve sent a confirmation link to{'\n'}
            <Text className="text-content-primary font-inter-semibold">{email}</Text>
          </Text>

          <View className="w-full">
            <Button onPress={handleOpenEmailApp}>Open email app</Button>
          </View>

          <Pressable onPress={handleGoBack} className="mt-4">
            <Text className="text-sm font-inter-semibold text-brand-accent">Change email</Text>
          </Pressable>

          <View className="items-center mt-10">
            {resendError && (
              <Text className="text-sm font-inter text-content-badge-error mb-2">{resendError}</Text>
            )}
            {resendSuccess && !resendError && (
              <Text className="text-sm font-inter text-content-badge-success mb-2">Email sent!</Text>
            )}

            {isActive ? (
              <Text className="text-sm font-inter text-content-tertiary">
                Didn{`'`}t get it? Resend in {secondsLeft}s
              </Text>
            ) : (
              <Pressable onPress={handleResend} disabled={loading}>
                <Text className="text-sm font-inter text-content-secondary">
                  Didn{`'`}t get it?{' '}
                  <Text className="font-inter-semibold text-brand-accent">Resend</Text>
                </Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </View>
  )
}

export default CheckEmailScreen
