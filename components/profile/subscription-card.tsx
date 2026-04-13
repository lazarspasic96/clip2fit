import { useRouter } from 'expo-router'
import { Crown, ExternalLink, RotateCcw } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Linking, Platform, Pressable, Text, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useSubscription } from '@/contexts/subscription-context'

const MANAGE_SUBSCRIPTIONS_URL = Platform.select({
  ios: 'https://apps.apple.com/account/subscriptions',
  default: 'https://play.google.com/store/account/subscriptions',
})

export const SubscriptionCard = () => {
  const { isPremium, restore, loading } = useSubscription()
  const router = useRouter()
  const [restoring, setRestoring] = useState(false)

  const handleManage = () => {
    Linking.openURL(MANAGE_SUBSCRIPTIONS_URL)
  }

  const handleRestore = async () => {
    setRestoring(true)
    const result = await restore()
    setRestoring(false)
    if (result.success) {
      Alert.alert('Restored', 'Your subscription has been restored.')
    } else {
      Alert.alert('Restore', result.error)
    }
  }

  const handleUpgrade = () => {
    router.push('/(protected)/sheets/paywall')
  }

  return (
    <View
      className="gap-3 rounded-[30px] border bg-background-secondary p-4"
      style={{
        borderColor: isPremium ? Colors.brand.accent + '33' : Colors.border.primary,
        borderCurve: 'continuous',
      }}
    >
      <View className="gap-1">
        <Text className="text-[11px] font-inter-semibold uppercase tracking-[2px] text-content-tertiary">
          Subscription
        </Text>
        <Text className="text-xl font-inter-bold text-content-primary">Your plan</Text>
      </View>

      {/* Current plan badge */}
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: isPremium ? 'rgba(132,204,22,0.12)' : 'rgba(39,39,42,0.92)',
            borderCurve: 'continuous',
          }}
        >
          <Crown size={18} color={isPremium ? Colors.brand.accent : Colors.content.secondary} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-inter-semibold text-content-primary">
            {isPremium ? 'Premium' : 'Free'}
          </Text>
          <Text className="text-xs font-inter text-content-tertiary">
            {isPremium ? 'Unlimited conversions and workouts' : 'Limited to 3 workouts'}
          </Text>
        </View>
      </View>

      {isPremium ? (
        <Pressable
          onPress={handleManage}
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-border-primary py-3"
          style={{ borderCurve: 'continuous' }}
        >
          <ExternalLink size={15} color={Colors.content.secondary} pointerEvents="none" />
          <Text className="text-sm font-inter-semibold text-content-secondary">
            Manage Subscription
          </Text>
        </Pressable>
      ) : (
        <View className="gap-2">
          <Pressable
            onPress={handleUpgrade}
            className="items-center justify-center rounded-2xl py-3.5"
            style={{ backgroundColor: Colors.brand.accent, borderCurve: 'continuous' }}
          >
            <Text
              className="text-sm font-inter-semibold"
              style={{ color: Colors.background.primary }}
            >
              Upgrade to Premium
            </Text>
          </Pressable>

          <Pressable
            onPress={handleRestore}
            disabled={restoring || loading}
            className="flex-row items-center justify-center gap-2 py-2"
          >
            <RotateCcw size={13} color={Colors.content.tertiary} pointerEvents="none" />
            <Text className="text-xs font-inter text-content-tertiary">
              {restoring ? 'Restoring...' : 'Restore Purchases'}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  )
}
