import { PaywallContent } from '@/components/paywall/paywall-content'
import { useCompleteOnboarding } from '@/hooks/use-complete-onboarding'
import { useLocalSearchParams } from 'expo-router'

const PaywallScreen = () => {
  const { complete } = useCompleteOnboarding()
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>()

  const handleComplete = async () => {
    await complete()
  }

  return (
    <PaywallContent
      onComplete={handleComplete}
      onSkip={handleComplete}
      workoutId={workoutId}
    />
  )
}

export default PaywallScreen
