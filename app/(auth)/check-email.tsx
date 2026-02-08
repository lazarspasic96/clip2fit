import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { useCountdown } from '@/hooks/use-countdown'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft } from 'lucide-react-native'
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
    <View className="flex-1 bg-background-primary" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View className="px-6 pt-4">
        <Pressable onPress={handleGoBack} hitSlop={8}>
          <ArrowLeft size={24} color="#fafafa" />
        </Pressable>
      </View>

      <View className="flex-1 px-6 pt-12">
        <Text className="text-2xl font-inter-bold text-content-primary mb-3">Check your inbox</Text>

        <Text className="text-base font-inter text-content-secondary mb-8">
          We{`'`}ve sent a link to <Text className="text-content-primary font-inter-semibold">{email}</Text>. Click on the
          email to sign in.
        </Text>

        <Button onPress={handleOpenEmailApp}>Open email app</Button>

        <Pressable onPress={handleGoBack} className="items-center mt-4">
          <Text className="text-sm font-inter-semibold text-brand-accent">Change email</Text>
        </Pressable>

        <View className="items-center mt-8">
          {resendError && <Text className="text-sm font-inter text-content-badge-error mb-2">{resendError}</Text>}
          {resendSuccess && !resendError && (
            <Text className="text-sm font-inter text-content-badge-success mb-2">Email sent!</Text>
          )}

          {isActive ? (
            <Text className="text-sm font-inter text-content-tertiary">
              Don{`'`}t see an email? Resend in {secondsLeft} sec
            </Text>
          ) : (
            <Pressable onPress={handleResend} disabled={loading}>
              <Text className="text-sm font-inter text-content-secondary">
                Don{`'`}t see an email? <Text className="font-inter-semibold text-brand-accent">Resend</Text>
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

export default CheckEmailScreen
