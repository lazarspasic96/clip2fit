import type { SubscriptionPlan } from '@/types/subscription'
import { PLAN_DISPLAY } from '@/types/subscription'
import { useSubscription } from '@/contexts/subscription-context'
import { Colors } from '@/constants/colors'
import { PlanCard } from '@/components/paywall/plan-card'
import { PlatformChips } from '@/components/paywall/platform-chips'
import { WorkoutPreviewCard } from '@/components/paywall/workout-preview-card'
import { useState } from 'react'
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PLAN_ORDER: SubscriptionPlan[] = ['annual', 'weekly']

interface PaywallContentProps {
  onComplete: () => void
  onSkip?: () => void
  workoutId?: string
}

export const PaywallContent = ({ onComplete, onSkip, workoutId }: PaywallContentProps) => {
  const insets = useSafeAreaInsets()
  const { purchase, restore, loading, planPricing } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('annual')
  const [restoring, setRestoring] = useState(false)

  const handlePurchase = async () => {
    const result = await purchase(selectedPlan)
    if (result.success) {
      onComplete()
      return
    }
    if (!result.cancelled) {
      Alert.alert('Purchase Failed', result.error)
    }
  }

  const handleRestore = async () => {
    setRestoring(true)
    const result = await restore()
    setRestoring(false)
    if (result.success) {
      onComplete()
      return
    }
    Alert.alert('Restore', result.error)
  }

  const ctaLabel = selectedPlan === 'annual' ? 'Start Free Trial' : 'Subscribe Weekly'

  return (
    <View className="flex-1 bg-background-primary">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingTop: insets.top + 20, paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Headline */}
        <Text
          style={{ fontFamily: 'Onest_400Regular', fontSize: 30, fontWeight: '700', lineHeight: 34.5, letterSpacing: -0.5 }}
          className="text-content-primary mb-2"
        >
          That was <Text style={{ color: Colors.brand.logo }}>one.</Text>
          {'\n'}Imagine unlimited.
        </Text>
        <Text className="text-[15px] font-inter text-content-secondary leading-[22px] mb-6">
          Every workout video you find, converted into a structured plan.
        </Text>

        {/* Platform chips */}
        <View className="mb-6">
          <PlatformChips />
        </View>

        {/* Workout preview card */}
        <View className="mb-6">
          <WorkoutPreviewCard workoutId={workoutId} />
        </View>

        {/* Unlock message */}
        <Text className="text-sm font-inter text-content-secondary text-center leading-5 mb-5">
          You{"'"}ve used your{' '}
          <Text className="font-inter-semibold text-content-primary">1 free conversion</Text>.
          {'\n'}Go Pro for unlimited.
        </Text>

        {/* Plan cards */}
        <View className="gap-2.5">
          {PLAN_ORDER.map((plan) => {
            const display = PLAN_DISPLAY[plan]
            const pricing = planPricing[plan]
            const price = pricing?.priceString ?? display.price
            return (
              <PlanCard
                key={plan}
                plan={plan}
                label={plan === 'annual' ? 'Annual \u00B7 7-day trial' : display.label}
                price={price}
                period={display.period}
                tag={display.tag}
                selected={selectedPlan === plan}
                onPress={() => setSelectedPlan(plan)}
              />
            )
          })}
        </View>

        {/* CTA */}
        <Pressable
          onPress={handlePurchase}
          disabled={loading}
          className="items-center justify-center rounded-3xl py-4 mt-5"
          style={{ backgroundColor: Colors.brand.accent, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? (
            <ActivityIndicator color={Colors.background.secondary} />
          ) : (
            <Text style={{ fontSize: 16, fontWeight: '600', letterSpacing: -0.2, color: Colors.background.secondary }}>
              {ctaLabel}
            </Text>
          )}
        </Pressable>

        {/* Restore */}
        <Pressable onPress={handleRestore} disabled={restoring} className="mt-3 py-2">
          <Text className="text-[13px] font-inter text-content-tertiary text-center">
            {restoring ? 'Restoring...' : 'Restore Purchases'}
          </Text>
        </Pressable>

        {/* Terms */}
        <Text className="text-[11px] font-inter text-content-tertiary text-center leading-[17px] mt-2.5 px-2"
          style={{ color: Colors.border.secondary }}
        >
          7-day free trial for annual plan. {planPricing.annual?.priceString ?? '$29.99'}/year auto-renews. Weekly plan {planPricing.weekly?.priceString ?? '$7.99'}/week auto-renews. Cancel anytime in Settings.{' '}
          <Text
            onPress={() => Linking.openURL('https://clip2fit.com/terms')}
            style={{ textDecorationLine: 'underline', color: Colors.border.secondary }}
          >
            Terms
          </Text>
          {' \u00B7 '}
          <Text
            onPress={() => Linking.openURL('https://clip2fit.com/privacy')}
            style={{ textDecorationLine: 'underline', color: Colors.border.secondary }}
          >
            Privacy
          </Text>
        </Text>

        {/* Skip / Continue with limited */}
        {onSkip !== undefined && (
          <Pressable onPress={onSkip} className="mt-3.5 py-2">
            <Text className="text-[13px] font-inter text-content-tertiary text-center">
              Continue with limited features
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  )
}
