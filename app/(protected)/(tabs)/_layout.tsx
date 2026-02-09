import { Tabs } from 'expo-router'

import { CustomTabBar } from '@/components/ui/custom-tab-bar'

const TabLayout = () => {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="my-workouts" />
    </Tabs>
  )
}

export default TabLayout
