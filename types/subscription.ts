export type SubscriptionPlan = 'weekly' | 'annual'

export type SubscriptionTier = 'free' | 'premium'

export type PurchaseResult =
  | { success: true }
  | { success: false; error: string; cancelled?: boolean }

export interface PlanPricing {
  priceString: string
}

export interface SubscriptionContextType {
  tier: SubscriptionTier
  isPremium: boolean
  initialized: boolean
  loading: boolean
  purchase: (plan: SubscriptionPlan) => Promise<PurchaseResult>
  restore: () => Promise<PurchaseResult>
  planPricing: Record<SubscriptionPlan, PlanPricing | null>
}

export const ENTITLEMENT_ID = 'premium'

export const FREE_WORKOUT_LIMIT = 3

export const PLAN_PRODUCT_IDS: Record<SubscriptionPlan, string> = {
  weekly: 'clip2fit.weekly',
  annual: 'clip2fit.annual',
}

export const PLAN_DISPLAY: Record<SubscriptionPlan, { label: string; price: string; period: string; tag?: string }> = {
  annual: { label: 'Annual', price: '$29.99', period: '/year', tag: 'SAVE 93%' },
  weekly: { label: 'Weekly', price: '$7.99', period: '/week' },
}
