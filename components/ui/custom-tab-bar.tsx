import { type BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { BlurView } from 'expo-blur'
import { CalendarDays, Dumbbell, House } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { Colors } from '@/constants/colors'
import { TAB_BAR_HEIGHT } from '@/constants/layout'

const TAB_CONFIG: Record<string, { icon: typeof Dumbbell; label: string }> = {
  index: { icon: House, label: 'Home' },
  schedule: { icon: CalendarDays, label: 'Schedule' },
  'my-workouts': { icon: Dumbbell, label: 'Library' },
}

export const CustomTabBar = ({ state, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets()

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
        className="flex-row items-center border-t pt-4 border-border-primary"
        style={{ flex: 1, paddingBottom: insets.bottom }}
      >
        {state.routes.map((route, i) =>
          renderTab(route.name, route.key, state.index === i)
        )}
      </View>
    </BlurView>
  )
}
