import { H2, Paragraph, Text, YStack } from 'tamagui'
import { Link } from 'expo-router'
import { ToastControl } from 'app/current-toast'
import { useAppStore } from 'store'

export default function HomeScreen() {
  const { isDarkMode } = useAppStore()
  return (
    <YStack flex={1} items="center" gap="$8" px="$10" pt="$5" bg="$background">
      <H2 text="center">Welcome to Clip2Fit</H2>

      <ToastControl />

      <Text>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Text>

      <YStack
        items="center"
        justify="center"
        gap="$1.5"
        position="absolute"
        bg="#f0f0f0"
        height="100%"
        b="$8"
      >
        <Link href="../home-nested">Go to home-nested</Link>
        <Paragraph fontSize="$5" text="center">
          Clip2Fit is a fitness app that helps you to track your workouts and progress.
        </Paragraph>
      </YStack>
    </YStack>
  )
}
