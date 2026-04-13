import type { CustomerInfo, PurchasesOfferings } from 'react-native-purchases'
import type { PlanPricing, PurchaseResult, SubscriptionContextType, SubscriptionPlan, SubscriptionTier } from '@/types/subscription'
import { ENTITLEMENT_ID } from '@/types/subscription'
import { useAuth } from '@/contexts/auth-context'
import Purchases, { LOG_LEVEL } from 'react-native-purchases'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

const RC_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? '',
  default: '',
})

const getTierFromCustomerInfo = (info: CustomerInfo): SubscriptionTier => {
  const entitlement = info.entitlements.active[ENTITLEMENT_ID]
  return entitlement !== undefined ? 'premium' : 'free'
}

const extractPlanPricing = (
  offerings: PurchasesOfferings | null,
): Record<SubscriptionPlan, PlanPricing | null> => {
  const current = offerings?.current
  if (current === null || current === undefined) {
    return { weekly: null, annual: null }
  }

  const annualPkg = current.annual
  const weeklyPkg = current.weekly

  return {
    annual:
      annualPkg !== null && annualPkg !== undefined
        ? { priceString: annualPkg.product.priceString }
        : null,
    weekly:
      weeklyPkg !== null && weeklyPkg !== undefined
        ? { priceString: weeklyPkg.product.priceString }
        : null,
  }
}

export const SubscriptionProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()
  const [tier, setTier] = useState<SubscriptionTier>('free')
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [configured, setConfigured] = useState(false)
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null)
  const configuredRef = useRef(false)

  // Configure RevenueCat once — setConfigured triggers user sync effect
  useEffect(() => {
    if (configuredRef.current || RC_API_KEY.length === 0) return
    configuredRef.current = true

    const init = async () => {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG)
      }

      await Purchases.configure({ apiKey: RC_API_KEY })
      setConfigured(true)
    }

    init().catch(() => {
      // Configure failed — likely invalid API key or missing store setup
    })
  }, [])

  // Sync RevenueCat user identity and fetch offerings after configure completes
  useEffect(() => {
    if (!configured) return

    const syncUser = async () => {
      try {
        if (user !== null) {
          const { customerInfo } = await Purchases.logIn(user.id)
          setTier(getTierFromCustomerInfo(customerInfo))
        } else {
          await Purchases.logOut()
          setTier('free')
        }
      } catch {
        // logOut throws if already anonymous — safe to ignore
      }

      try {
        const off = await Purchases.getOfferings()
        setOfferings(off)
      } catch {
        // Offerings fetch failed — prices will use fallback display values
      }

      setInitialized(true)
    }

    syncUser()
  }, [user, configured])

  // Listen for subscription changes (renewals, cancellations, restores)
  useEffect(() => {
    if (!configured) return

    const onUpdate = (info: CustomerInfo) => {
      setTier(getTierFromCustomerInfo(info))
    }

    Purchases.addCustomerInfoUpdateListener(onUpdate)

    return () => {
      Purchases.removeCustomerInfoUpdateListener(onUpdate)
    }
  }, [configured])

  const purchase = async (plan: SubscriptionPlan): Promise<PurchaseResult> => {
    setLoading(true)
    try {
      const off = offerings ?? (await Purchases.getOfferings())
      const current = off.current

      if (current === null || current === undefined) {
        return { success: false, error: 'No offerings available' }
      }

      const pkg = plan === 'annual' ? current.annual : current.weekly

      if (pkg === null || pkg === undefined) {
        return { success: false, error: `Package not found for plan: ${plan}` }
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg)
      setTier(getTierFromCustomerInfo(customerInfo))
      return { success: true }
    } catch (error: unknown) {
      if (error !== null && typeof error === 'object' && 'userCancelled' in error) {
        const rcError = error as { userCancelled: boolean; message?: string }
        if (rcError.userCancelled) {
          return { success: false, error: 'Purchase cancelled', cancelled: true }
        }
      }
      const message = error instanceof Error ? error.message : 'Purchase failed'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const restore = async (): Promise<PurchaseResult> => {
    setLoading(true)
    try {
      const customerInfo = await Purchases.restorePurchases()
      setTier(getTierFromCustomerInfo(customerInfo))

      const isPremiumNow = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined
      if (!isPremiumNow) {
        return { success: false, error: 'No active subscriptions found' }
      }
      return { success: true }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Restore failed'
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPremium: tier === 'premium',
        initialized,
        loading,
        purchase,
        restore,
        planPricing: extractPlanPricing(offerings),
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  )
}

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
