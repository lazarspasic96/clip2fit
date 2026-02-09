import { type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { useRouter } from 'expo-router'
import { Dumbbell, House, Plus } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@/constants/colors'
import { TAB_BAR_HEIGHT } from '@/constants/layout'

const TAB_CONFIG: Record<string, { icon: typeof Dumbbell; label: string }> = {
  index: { icon: House, label: 'Home' },
  'my-workouts': { icon: Dumbbell, label: 'My Workouts' },
}

export const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const renderTab = (routeName: string, routeKey: string, isFocused: boolean) => {
    const config = TAB_CONFIG[routeName]
    if (!config) return null

    const Icon = config.icon
    const color = isFocused ? Colors.brand.accent : Colors.content.tertiary

    return (
      <Pressable
        key={routeKey}
        onPress={() => navigation.navigate(routeName)}
        className="items-center justify-center"
        style={{ flex: 1 }}
      >
        <Icon size={24} color={color} pointerEvents="none" />
        <Text className="text-xs font-inter mt-1" style={{ color }}>
          {config.label}
        </Text>
      </Pressable>
    )
  }

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: TAB_BAR_HEIGHT }}
    >
      <View
        className="flex-row items-center justify-around border-t pt-4 border-border-primary"
        style={{ flex: 1, paddingBottom: insets.bottom }}
      >
        {/* Left tab */}
        {renderTab(state.routes[0].name, state.routes[0].key, state.index === 0)}

        {/* Center FAB */}
        <Pressable
          onPress={() => router.push('/(protected)/add-workout')}
          className="items-center justify-center rounded-full bg-brand-accent"
          style={{ width: 56, height: 56, marginTop: -50 }}
        >
          <Plus size={28} color={Colors.background.primary} strokeWidth={2.5} pointerEvents="none" />
        </Pressable>

        {/* Right tab */}
        {state.routes.length > 1 && renderTab(state.routes[1].name, state.routes[1].key, state.index === 1)}
      </View>
    </BlurView>
  )
}
