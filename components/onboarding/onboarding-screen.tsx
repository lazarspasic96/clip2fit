import { BackButton } from '@/components/ui/back-button'
import { Button } from '@/components/ui/button'
import { ScrollView, Text, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface OnboardingScreenProps {
  title: string
  subtitle?: string
  onNext: () => void
  onSkip?: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  loading?: boolean
  children: React.ReactNode
  scrollable?: boolean
  keyboardAware?: boolean
}

export const OnboardingScreen = ({
  title,
  subtitle,
  onNext,
  onSkip,
  onBack,
  nextLabel = 'Next',
  nextDisabled,
  loading,
  children,
  scrollable = true,
  keyboardAware = false,
}: OnboardingScreenProps) => {
  const insets = useSafeAreaInsets()

  const content = (
    <>
      {onBack !== undefined && <BackButton onPress={onBack} className="self-start mb-4" />}
      <Text className="text-2xl font-inter-bold text-content-primary mb-2">{title}</Text>
      {subtitle !== undefined && subtitle.length > 0 && (
        <Text className="text-base font-inter text-content-secondary mb-8">{subtitle}</Text>
      )}
      {children}
    </>
  )

  const scrollContent = keyboardAware ? (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </KeyboardAwareScrollView>
  ) : scrollable ? (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ padding: 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  ) : (
    <View className="flex-1 px-6 pt-6">{content}</View>
  )

  return (
    <View className="flex-1 bg-background-primary">
      {scrollContent}
      <View
        className="px-6 gap-3"
        style={{ paddingBottom: Math.max(insets.bottom, 32) }}
      >
        <Button onPress={onNext} disabled={nextDisabled} loading={loading}>
          {nextLabel}
        </Button>
        {onSkip !== undefined && (
          <Button variant="ghost" onPress={onSkip}>
            Skip
          </Button>
        )}
      </View>
    </View>
  )
}
