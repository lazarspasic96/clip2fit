import { useRouter } from 'expo-router'

import { useSubscription } from '@/contexts/subscription-context'

export const usePremiumGate = () => {
  const { isPremium } = useSubscription()
  const router = useRouter()

  const requirePremium = (callback: () => void) => {
    if (isPremium) {
      callback()
      return
    }
    router.push('/(protected)/sheets/paywall')
  }

  return { isPremium, requirePremium }
}
