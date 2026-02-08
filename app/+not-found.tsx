import { Link, Stack } from 'expo-router'
import { Text, View } from 'react-native'

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View className="flex-1 items-center justify-center bg-background-primary px-6">
        <Text className="text-2xl font-inter-bold text-content-primary mb-2">Page not found</Text>
        <Text className="text-base font-inter text-content-secondary mb-8">
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/" className="text-brand-accent font-inter-semibold text-base">
          Go to home
        </Link>
      </View>
    </>
  )
}
