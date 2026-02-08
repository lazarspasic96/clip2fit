import { Tabs } from 'expo-router'
import { BookOpen, HomeIcon, Settings } from 'lucide-react-native'

import { Colors } from '@/constants/colors'

const TAB_BAR_STYLE = {
  backgroundColor: Colors.background.primary,
  borderTopColor: Colors.border.primary,
} as const

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.brand.accent,
        tabBarInactiveTintColor: Colors.content.tertiary,
        tabBarStyle: TAB_BAR_STYLE,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  )
}
