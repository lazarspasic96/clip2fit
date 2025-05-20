import { Stack } from 'expo-router'

export default function HomeLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: 'white' },
        headerStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="index" options={{ title: '', headerShown: false }} />
      <Stack.Screen name="home-nested" options={{ title: 'Home Nested' }} />
    </Stack>
  )
}
