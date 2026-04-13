import { useRouter } from 'expo-router'
import { Pressable, View } from 'react-native'
import { X } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { PaywallContent } from '@/components/paywall/paywall-content'
import { Colors } from '@/constants/colors'

const PaywallSheet = () => {
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const handleDismiss = () => {
    if (router.canDismiss()) {
      router.dismiss()
    } else {
      router.back()
    }
  }

  return (
    <View className="flex-1 bg-background-secondary">
      {/* Close button */}
      <View
        className="flex-row justify-end px-4"
        style={{ paddingTop: Math.max(insets.top, 12) }}
      >
        <Pressable
          onPress={handleDismiss}
          className="w-8 h-8 items-center justify-center rounded-full bg-background-tertiary"
          hitSlop={12}
        >
          <X size={16} color={Colors.content.secondary} pointerEvents="none" />
        </Pressable>
      </View>

      <PaywallContent onComplete={handleDismiss} />
    </View>
  )
}

export default PaywallSheet
