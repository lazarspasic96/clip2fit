import { Tabs } from 'expo-router'
import { BlurView } from 'expo-blur'
import { NativeTabs } from 'expo-router/unstable-native-tabs'
import { CalendarDays, ChartColumn, Dumbbell, House } from 'lucide-react-native'
import { Platform, StyleSheet, View } from 'react-native'

import { Colors } from '@/constants/colors'
import { useTabBarPolicy } from '@/hooks/use-tab-bar-policy'

const IS_ANDROID = Platform.OS === 'android'

const styles = StyleSheet.create({
  legacyTabBar: {
    position: 'absolute',
    borderTopWidth: 0,
    backgroundColor: 'transparent',
  },
  androidTabBar: {
    borderTopWidth: 0,
    backgroundColor: Colors.background.secondary,
    elevation: 8,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(24,24,27,0.15)',
  },
})

const TabLayout = () => {
  const tabBarPolicy = useTabBarPolicy()

  if (tabBarPolicy.useExpoBlurTabsFallback) {
    return (
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.brand.accent,
          tabBarInactiveTintColor: Colors.content.secondary,
          tabBarStyle: IS_ANDROID ? styles.androidTabBar : styles.legacyTabBar,
          tabBarBackground: IS_ANDROID
            ? undefined
            : () => (
                <View style={styles.blurBackground}>
                  <BlurView
                    tint="systemChromeMaterialDark"
                    intensity={95}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.blurOverlay} />
                </View>
              ),
        }}
      >
        <Tabs.Screen
          name="(home)"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <House color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="schedule"
          options={{
            title: 'Schedule',
            tabBarIcon: ({ color, focused }) => (
              <CalendarDays color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="my-workouts"
          options={{
            title: 'Library',
            tabBarIcon: ({ color, focused }) => (
              <Dumbbell color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ color, focused }) => (
              <ChartColumn color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
            ),
          }}
        />
      </Tabs>
    )
  }

  return (
    <NativeTabs
      tintColor={Colors.brand.accent}
      backgroundColor={tabBarPolicy.backgroundColor}
      blurEffect={tabBarPolicy.blurEffect}
      disableTransparentOnScrollEdge={tabBarPolicy.disableScrollEdgeTransparency}
      minimizeBehavior={tabBarPolicy.minimizeBehavior}
    >
      <NativeTabs.Trigger name="(home)">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="schedule">
        <NativeTabs.Trigger.Label>Schedule</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my-workouts">
        <NativeTabs.Trigger.Label>Library</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'dumbbell', selected: 'dumbbell.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="stats">
        <NativeTabs.Trigger.Label>Stats</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  )
}

export default TabLayout
