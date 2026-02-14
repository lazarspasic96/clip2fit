import { NativeTabs } from 'expo-router/unstable-native-tabs'

import { Colors } from '@/constants/colors'

const TabLayout = () => {
  return (
    <NativeTabs
      tintColor={Colors.brand.accent}
      minimizeBehavior="onScrollDown"
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
    </NativeTabs>
  )
}

export default TabLayout
